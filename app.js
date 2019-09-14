const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require('fs');

require("dotenv").config();

const routers = require("./routes");

const app=express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.set("jwt-secret", process.env.SECRET_CODE);

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
app.use(logger("dev"));
app.use(bodyParser.json({limit: "1gb"}));
app.use(bodyParser.urlencoded({limit: "1gb", extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/userFile", express.static("uploads"));
app.use("/thumbnails", express.static("thumbnails"));

if(!fs.existsSync('./uploads')){
  fs.mkdirSync('./uploads');
}
if(!fs.existsSync('./thumbnails')){
  fs.mkdirSync('./thumbnails');
}
app.use("/", routers);

app.use("/check", function (req, res, next) {
  res.status(200).json({message: "success"});
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500).json({
    success: false,
    message: err.message
  });
});

module.exports = app;
