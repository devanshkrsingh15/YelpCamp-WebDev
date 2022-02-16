const mongoose = require('mongoose')
const Schema = mongoose.Schema // to prevent from writing mongoose.Schema again and again

const CampgroundSchema = new Schema({
    title : String,
    price : Number,
    image : String,
    description : String,
    location : String
});

module.exports = mongoose.model('Campground',CampgroundSchema);
