var express = require("express");
var router = express.Router();
var users = require("./users");
var design = require("./design");
var admins = require("./admins")

/* GET home page. */
router.use("/users", users);
router.use("/design", design);
router.use("/admins", admins);

module.exports = router;
