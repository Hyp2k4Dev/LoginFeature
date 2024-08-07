const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  verificationCode: String,
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  resetToken: String,
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
