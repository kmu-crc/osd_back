var express = require("express");
var router = express.Router();
var { signUp } = require("./signUp");

router.post("/signUp/", signUp);

module.exports = router;
