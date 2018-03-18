var express = require("express");
var connection = require("../configs/connection");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  console.log("get");
  connection.query("SELECT * FROM user", function (err, rows) {
    console.log("get2");
    if (err) throw err;

    console.log("The solution is: ", rows);
    res.status(200).json(rows);
  });
});

module.exports = router;
