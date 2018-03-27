var express = require("express");
var router = express.Router();
var users = require("./users");
var design = require("./design");
var files = require("./files");

/* GET home page. */
router.use("/users", users);
router.use("/design", design);
router.use("/files", files);

module.exports = router;
