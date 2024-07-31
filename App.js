const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Cấu hình session
app.use(
  session({
    secret: "your-secret-key", // Thay đổi thành khóa bí mật mạnh
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Đặt `secure: true` nếu bạn đang sử dụng HTTPS
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true })); // Để phân tích dữ liệu từ form
app.use(express.static(path.join(__dirname, "public"))); // Phục vụ các file tĩnh

// Cửa hàng người dùng giả lập
const users = {
  "user@example.com": { email: "user@example.com", password: "password123" },
};

// Middleware kiểm tra nếu người dùng đã đăng nhập
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Các route
app.get("/", isAuthenticated, (req, res) => {
  res.render("home", { username: req.session.user.username });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = Object.values(users).find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    req.session.user = { username };
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", (req, res) => {
  const { email, password, username } = req.body;

  if (users[email]) {
    return res.redirect("/register");
  }

  users[email] = { username, password };
  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
