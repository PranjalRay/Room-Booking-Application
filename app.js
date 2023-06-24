const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const { Room, Booking } = require("./models");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "my super secret key",
    resave: false,
    saveUninitialized: false,
  })
);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res) => {
  res.render("index");
});
app.post("/register", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });
    res.redirect("/login");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send("Invalid credentials");
    }
    req.session.user = user;
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("dashboard", { user: req.session.user });
});
app.post("/bookings", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const { roomId, startTime, endTime } = req.body;
  try {
    await Booking.create({
      roomId,
      startTime,
      endTime,
      userId: req.session.user.id,
    });
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/bookings", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.session.user.id },
      include: [{ model: Room }],
    });
    res.render("bookings", { bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send("Internal Server Error");
  }
});
module.exports = app;
