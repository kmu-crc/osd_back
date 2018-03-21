var express = require("express");
var router = express.Router();
var users = require("./users");
var design = require("./design");

/* GET home page. */
router.use("/users", users);
router.use("/design", design);

module.exports = router;
