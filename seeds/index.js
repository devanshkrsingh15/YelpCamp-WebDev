const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelper");
const Campground = require("../models/campground");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Connection Established with MongoDB");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error!");
    console.log(err);
  });

  const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (var i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 1000) + 10;

        const camp = new Campground({
          author : '621239aa7ac8d1d3966588b1',
            location: `${sample(cities).city}, ${sample(cities).admin_name}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: { type: 'Point', coordinates: [
              sample(cities).lng,
              sample(cities).lat,
          ] },
            images: [
              {
                url: 'https://res.cloudinary.com/djq02hgdf/image/upload/v1645465027/YelCamp/iazvw4nmevlxjpdgwdkn.jpg',
                filename: 'YelCamp/iazvw4nmevlxjpdgwdkn',
              }
             
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price // short hand for price:price
        })
        await camp.save();
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
