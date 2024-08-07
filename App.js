// app.js
const express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  nodemailer = require("nodemailer"),
  methodOverride = require("method-override"),
  path = require("path");
const User = require("./model/User");
const Product = require("./model/Product");

let app = express();

// Multer storage configuration
const multer = require("multer");

// Define storage settings
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Define file filter to accept only png, jpg, jpeg
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(
      new Error("Only .png, .jpg, and .jpeg formats are allowed!"),
      false
    );
  }
};

// Create the multer instance for a single file
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: Limit file size (e.g., 5 MB)
});

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/Login");

// Setup view engine and middleware
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

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

// Nodemailer configuration
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

// ROUTES

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/secret", isLoggedIn, (req, res) => {
  res.render("secret");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email });

    if (user) {
      const resetToken = generateCode();
      user.resetToken = resetToken;
      await user.save();

      const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Password Reset Request",
        html: `
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Email sent: " + info.response);
      });

      res
        .status(200)
        .json({ message: "Password reset link sent to your email!" });
    } else {
      res.status(400).json({ error: "No user found with that email address" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

app.get("/reset-password/:token", (req, res) => {
  const token = req.params.token;
  res.render("reset-password", { token: token });
});

app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({ resetToken: token });

    if (user) {
      user.password = password; // Hash this password before saving in production
      user.resetToken = null; // Clear the reset token
      await user.save();

      res
        .status(200)
        .json({ message: "Password has been reset successfully!" });
    } else {
      res.status(400).json({ error: "Invalid or expired reset token" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
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

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Email sent: " + info.response);
    });

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

app.get("/verify/:code", async (req, res) => {
  try {
    const verificationCode = req.params.code;

    const user = await User.findOne({ verificationCode: verificationCode });

    if (user) {
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user) {
      const result = req.body.password === user.password;

      if (result) {
        if (user.isVerified) {
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

app.get("/logout", (req, res) => {
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

// Product Routes

// Show all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.render("products", { products });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Show form to add a new product
app.get("/products/new", (req, res) => {
  res.render("new-product");
});

// Handle form submission to add a new product
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const image = req.file ? req.file.filename : null; // Get the filename of the uploaded image

    // Create a new product with the uploaded image
    const newProduct = new Product({
      name,
      description,
      price,
      image, // Save the image filename
    });

    await newProduct.save();
    res.redirect("/products");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Show form to edit a product
app.get("/products/:id/edit", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("edit-product", { product });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Handle form submission to update a product
app.put("/products/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name;
      product.description = description;
      product.price = price;
      if (req.file) {
        product.image = req.file.filename; // Update image
      }

      await product.save();
      res.redirect(`/products/${product._id}`);
    } else {
      res.status(404).send("Product Not Found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Show details of a single product
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("product-details", { product });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
