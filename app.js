if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const User = require('./models/user');


const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const app = express();
const MongoDBStore = require("connect-mongo")(session);
//protection from MONGO INJECTION
app.use(mongoSanitize({
  replaceWith: '_'
}))
//"mongodb://localhost:27017/yelp-camp" => local
// const dbURL = process.env.DB_URL //cloud MONGO ATLAS //only when in production environment
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Connection Established with MongoDB");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error!");
    console.log(err);
  });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride("_method"));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
  store,
  name : "session", //cookie name instead of default name
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      //secure : true, // only when deployed, as local host is not https
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //in milliseconds 
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}


app.use(session(sessionConfig))
app.use(flash());

//this should come after session middleware
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); //use local strategy and use authenticate method (automatically added) 

//how to store user in a session
passport.serializeUser(User.serializeUser());
// how to get user in a session
passport.deserializeUser(User.deserializeUser());


//middleware for storing globals 
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

//using routers -> cleaning
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});


//for any method if above routes are not met
app.all("*", (req, res, next) => {
  //sending to error handler middleware
  next(new ExpressError("Page Not Found", 404));
});

//middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
