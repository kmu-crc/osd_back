var express = require("express");
var router = express.Router();
var { signUp } = require("./signUp");
var { basicSignIn } = require("./basicSignIn");

router.post("/signUp/", signUp);
router.post("/basicSignIn", basicSignIn);

module.exports = router;
