var express = require("express");
var router = express.Router();
var auth = require("../../middlewares/auth");
var adminAuth = require("../../middlewares/adminAuth");
var createCountry = require("./createCountry");
var createSido = require("./createSido");

router.post("/createCountry", auth, adminAuth, createCountry);
router.post("/createSido", auth, adminAuth, createSido);

module.exports = router;
