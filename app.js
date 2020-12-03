var express = require("express");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var cors = require("cors");
var mqtt = require("mqtt");
var bodyParser = require("body-parser");
var client = mqtt.connect("ws://localhost:9001");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();
var cookie_name = "TestUser4Cokiee";
//-----------------MIDDLEWARE-------------------
app.use(cors());

app.use(
  session({
    name: "TestUser821Cokiee",
    secret: "we all love coe457",
    resave: true, // have to do with saving session under various conditions
    saveUninitialized: true, // just leave them as is
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  })
);
// need this to grab images etc.
app.use(express.static(__dirname + "/public"));
// speficy the port to listen to.
app.set("port", process.env.PORT || 8089);
app.use(cookieParser());

//------------------monogDB-------------------------
const mongoose = require("mongoose");

//connect to database
mongoose.connect("mongodb://localhost:27017/MotoApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// schema
const user_data_schema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String,
});
const user_location_data_schema = new mongoose.Schema({
  email: String,
  currentLatitude: Number,
  currentLongitude: Number,
  destinationLatitude: Number,
  destinationLongitude: Number,
});
// create a model of that schema
const user_data_model = mongoose.model("moto_app_user", user_data_schema);
const user_location_data_model = mongoose.model(
  "moto_app_user_location",
  user_location_data_schema
);

//--------PATHS----------------------------

app.get("/", function (req, res) {
  // subsequent time when page_views are NOT defined.

  if (req.session.page_views) {
    req.session.page_views++;
    res.send("You visited this page " + req.session.page_views + " times");
  } else {
    // first HTTP when page_views is not defined.
    req.session.page_views = 1;
    res.send("Welcome to this page for the first time!");
  }
});

app.post("/register", urlencodedParser, function (req, res) {
  var new_user_details = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
  };
  var new_user = new user_data_model(new_user_details);
  new_user.save();
  res.redirect("/login.html");
});

app.post("/login", urlencodedParser, function (req, res) {
  var login_details = {
    email: req.body.email,
    password: req.body.password,
    remember: req.body.remember == "on",
    cookiesAccepted: req.body.cookies == "on",
  };

  console.log("login: ");
  console.log(login_details);
  user_data_model.findOne(
    { email: login_details.email, password: login_details.password },
    function (err, user_data) {
      if (err) {
        console.log(err + " ");
      }
      // wrong credentials
      else if (!user_data) {
        // user_dat is null -not found
        res.redirect("/loginError.html");
      } else {
        // if cookies are accepted and email has already been set before
        if (req.body.cookies == "on" && req.session.email) {
          req.session.firstLogin = false;
        }
        // if cookies have been accepted but email no been set  = first visit
        else if (req.body.cookies == "on") {
          req.session.firstLogin = true;
          req.session.fName = user_data.first_name + " " + user_data.last_name;
          req.session.remember = req.body.remember == "on";
          req.session.email = user_data.email;
        }
        // cookies not accepted but first visit
        else {
          req.session.email = user_data.email;
        }
        console.log(req.session);
        req.session.save(function (err) {
          console.log("session saved");
          console.log(req.session);
          res.redirect("map.html");
        });
      }
    }
  );
});

app.get("/session_details", function (req, res) {
  var user_info = {
    email: req.session.email,
    name: req.session.fName,
    visit_time: req.session.last_access_time,
    first_login: req.session.firstLogin,
    remember: req.session.remember,
  };
  //Will be null without cookie consent
  if (req.session.fName != null) {
    req.session.last_access_time = new Date().toLocaleString();
  }
  //After first tiem sending, then reflect that its not their first time (ignore if cookie consent not given)
  if (req.session.email) {
    req.session.firstLogin = false;
  }
  console.log("/session_details called");
  console.log(user_info);
  res.json(user_info);
});

app.get("/logout", function (req, res) {
  res.clearCookie("TestUser821Cokiee");
  req.session.destroy();
  res.redirect("/login.html");
});

// custom 404 page
app.use(function (req, res) {
  res.type("text/plain");
  res.status(404);
  res.send("404 - Not Found");
});

// custom 500 page
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.type("text/plain");
  res.status(500);
  res.send("500 - Server Error");
});

// launch
app.listen(app.get("port"), function () {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; press Ctrl-C to terminate."
  );
});

//--------------------- mqtt functions ------------------
// if got new location- > save to location db
client.on("connect", function () {
  client.subscribe("IOThw3/loc", function (err) {
    if (!err) {
    }
  });
});
client.on("message", function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  var msg = JSON.parse(message.toString());

  var location = {
    email: msg.Email,
    currentLatitude: msg.sLat,
    currentLongitude: msg.sLng,
    destinationLatitude: msg.eLat,
    destinationLongitude: msg.eLng,
  };

  var location_update = new user_location_data_model(location);
  location_update.save();
});
