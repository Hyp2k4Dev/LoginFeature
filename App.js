const express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  nodemailer = require("nodemailer");
const User = require("./model/User");
let app = express();

mongoose.connect("mongodb://localhost:27017/Login");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=====================
// Nodemailer Configuration
//=====================

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "hiepnguyen170504@gmail.com",
    pass: "zopg tfgz tlid fglm",
  },
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

//=====================
// ROUTES
//=====================

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/secret", isLoggedIn, function (req, res) {
  res.render("secret");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const verificationCode = generateCode();

    const mailOptions = {
      from: "hiepnguyen170504@gmail.com",
      to: req.body.email,
      subject: "Your Verification Code",
      html: `
        <p>Your verification code is: ${verificationCode}</p>
        <p>Click the button below to verify your account:</p>
        <a href="http://localhost:3000/verify/${verificationCode}" style="
          display: inline-block;
          padding: 10px 20px;
          font-size: 16px;
          font-weight: bold;
          color: #ffffff;
          background-color: #007bff;
          text-decoration: none;
          border-radius: 5px;
        ">Verify</a>
      `,
    };

    // Gửi mã xác nhận qua email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Email sent: " + info.response);
    });

    // Lưu thông tin người dùng cùng với mã xác nhận
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      verificationCode: verificationCode,
      isVerified: false,
    });

    await user.save();
    res
      .status(200)
      .json({ message: "User registered, verification code sent to email!" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

// Handling verification
// Handling email verification
app.get("/verify/:code", async (req, res) => {
  try {
    // Lấy mã xác nhận từ URL
    const verificationCode = req.params.code;

    // Tìm kiếm người dùng với mã xác nhận này
    const user = await User.findOne({ verificationCode: verificationCode });

    if (user) {
      // Cập nhật trạng thái isVerified thành true
      user.isVerified = true;
      await user.save();

      res.send("Your account has been verified. You can now log in.");
    } else {
      res.status(404).send("Verification code is invalid.");
    }
  } catch (error) {
    res.status(500).send("Error verifying user.");
  }
});

//Showing login form
app.get("/login", function (req, res) {
  res.render("login");
});

//Handling user login
// Handling user login
app.post("/login", async function (req, res) {
  try {
    // Find the user by username
    const user = await User.findOne({ username: req.body.username });

    if (user) {
      // Check if the password matches
      const result = req.body.password === user.password;

      if (result) {
        // Check if the user is verified
        if (user.isVerified) {
          // Log the user in
          req.login(user, function (err) {
            if (err) return next(err);
            res.redirect("/secret");
          });
        } else {
          res.status(400).json({ error: "Account not verified yet" });
        }
      } else {
        res.status(400).json({ error: "Password doesn't match" });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started on port " + port);
});
