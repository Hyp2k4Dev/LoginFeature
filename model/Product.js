const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: {
    type: [String], // Array of strings
    default: [], // Default to an empty array
  },
});

productSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Product", productSchema);
