const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { User, Room, Booking, BookingRequest } = require("./models");

// Configure middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ where: { email: email } })
      .then(user => {
        if (!user) {
          return done(null, false, { message: "Invalid email or password." });
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return done(err);
          }
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid email or password." });
          }
        });
      })
      .catch(err => done(err));
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => {
      done(null, user);
    })
    .catch(err => done(err));
});

// Staff middleware
function Staff(request, response, next) {
  const userId = request.user.id;
  const staffRole = "staff";
  User.findOne({ where: { id: userId, role: staffRole } })
    .then(user => {
      if (user) {
        return next();
      } else {
        response.redirect("/");
        request.flash("error", "You don't have permission to access this page.");
      }
    })
    .catch(err => {
      console.error(err);
      response.redirect("/");
    });
}

// Admin middleware
function Admin(request, response, next) {
  const userId = request.user.id;
  const adminRole = "admin";
  User.findOne({ where: { id: userId, role: adminRole } })
    .then(user => {
      if (user) {
        return next();
      } else {
        response.redirect("/");
        request.flash("error", "You don't have permission to access this page.");
      }
    })
    .catch(err => {
      console.error(err);
      response.redirect("/");
    });
}

// Define routes
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/signup", (req, res) => {
  res.render("signup", { message: req.flash("error") });
});

app.post("/signup", (req, res) => {
  const { email, password, firstName } = req.body;
  User.create({ email, password, firstName })
    .then(user => {
      req.login(user, err => {
        if (err) {
          console.error(err);
          res.redirect("/signup");
        } else {
          res.redirect("/");
        }
      });
    })
    .catch(err => {
      console.error(err);
      res.redirect("/signup");
    });
});

app.get("/roomList", (req, res) => {
  Room.findAll()
    .then(rooms => {
      res.render("roomList", { rooms });
    })
    .catch(err => {
      console.error(err);
      res.render("roomList", { rooms: [] });
    });
});

app.get("/booking", (req, res) => {
  res.render("booking");
});

app.post("/book", (req, res) => {
  const { date, reason, members } = req.body;
  Booking.create({ date, reason, members })
    .then(() => {
      res.redirect("/roomList");
    })
    .catch(err => {
      console.error(err);
      res.redirect("/booking");
    });
});

module.exports = app;
