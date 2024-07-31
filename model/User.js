// Filename - model/User.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
var User = new Schema({
  username: {
    type: String,
  },
  email: { type: String, required: true, unique: true },

  password: {
    type: String,
  },
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", User);
