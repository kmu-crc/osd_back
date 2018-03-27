var express = require("express");
var router = express.Router();
var signUp = require("./signUp");
var signIn = require("./signIn");
var check = require("./check");
var auth = require("../../middlewares/auth");
var { FBSignIn, FBSignUp } = require("./FBRegistration");

router.post("/signUp", signUp, signIn);
router.post("/signIn", signIn);

router.use("/check", auth, check);

router.post("/FBSignUp", FBSignUp, FBSignIn);

router.post("/FBSignIn", FBSignIn, FBSignUp, FBSignIn);

module.exports = router;
