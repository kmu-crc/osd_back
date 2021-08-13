var mysql = require("mysql");
require("dotenv").config();
var db;
var options;

if (process.env.OPERATION === "true" || process.env.OPERATION === true) {
  options = {
    host:     process.env.AWS_DB_HOST,
    port:     process.env.AWS_DB_PORT,
    database: process.env.AWS_DB_NAME,
    user:     process.env.AWS_DB_USER,
    password: process.env.AWS_DB_PASS,
    multipleStatements:true
  };
} else if (process.env.DEVELOP === "true" || process.env.DEVELOP === true) {
  options = {
    host:     process.env.DEV_DB_HOST,
    port:     process.env.DEV_DB_PORT,
    database: process.env.DEV_DB_NAME,
    user:     process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASS,
    multipleStatements:true
  };
} else if (process.env.LOCAL === "true" || process.env.LOCAL === true) {
  options = {
    host:     process.env.LOCAL_DB_HOST,
    port:     process.env.LOCAL_DB_PORT,
    database: process.env.LOCAL_DB_NAME,
    user:     process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PASS,
    multipleStatements:true
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
		/*
		 db.on('error', function(err) {
		 	if(err.code === 'PROTOCOL_CONNECTION_LOST') {
				connectionDataBase();
			} else {
				throw err;
			}
		 });
		*/
  }
  return db;
};

module.exports = connectionDataBase();
