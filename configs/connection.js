var mysql = require("mysql");
require("dotenv").config();

var db;

var options = {
  host: "localhost",
  user: process.env.MYSQL_USER_NAME,
  password: process.env.MYSQL_PASSWARD,
  port: process.env.MYSQL_PORT,
  database: process.env.DATABASE_NAME
};

function connectionDataBase () {
  if (!db) {
    db = mysql.createConnection(options);

    db.connect(function (err) {
      if (!err) {
        console.log("DataBase Connected!");
      } else {
        console.log("Error DataBase Connection :" + err);
      }
    });
  }
  return db;
};

module.exports = connectionDataBase();
