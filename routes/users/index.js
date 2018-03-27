var express = require("express");
var router = express.Router();
var { signUp } = require("./signUp");
var { basicSignIn } = require("./basicSignIn");
var check = require("./check");
var auth = require("../../middlewares/auth");
var FBSignUp = require("./FBSignUp");
var FBSignIn = require("./FBSignIn");

router.post("/signUp", signUp);
router.post("/basicSignIn", basicSignIn);

router.use("/check", auth, check);

router.post("/FBSignUp", FBSignUp);

router.post("/FBSignIn", FBSignIn);

module.exports = router;
