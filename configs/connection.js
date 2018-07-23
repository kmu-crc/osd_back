var mysql = require("mysql");
require("dotenv").config();

var db;
var options;

console.log(process.env.OPERATION_DB_HOST, "process.env.OPERATION", process.env.OPERATION);

if (process.env.DEVELOP === "true" || process.env.DEVELOP === true) {
  options = {
    host: process.env.DEV_MYSQL_HOST,
    user: process.env.DEV_MYSQL_USER_NAME,
    password: process.env.DEV_MYSQL_PASSWARD,
    port: process.env.DEV_MYSQL_PORT,
    database: process.env.DEV_DATABASE_NAME
  };
} else if (process.env.OPERATION === "true" || process.env.OPERATION === true) {
  options = {
    host: process.env.OPERATION_DB_HOST,
    user: process.env.MYSQL_USER_NAME,
    password: process.env.MYSQL_PASSWARD,
    port: process.env.MYSQL_PORT,
    database: process.env.DATABASE_NAME
  };
} else if (process.env.LOCAL === "true" || process.env.LOCAL === true) {
  options = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER_NAME,
    password: process.env.MYSQL_PASSWARD,
    port: process.env.MYSQL_PORT,
    database: process.env.DATABASE_NAME
  };
}

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
