const express = require("express");
const router = express.Router();
const signUp = require("./signUp");
const signIn = require("./signIn");
const check = require("./check");
const auth = require("../../middlewares/auth");
const { FBSignIn, FBSignUp } = require("./FBRegistration");
const { insertDetail, modifyDetail } = require("./userDetail");
const stringToNumber = require("../../middlewares/stringToNumber");
const createThumbnail = require("../../middlewares/createThumbnail");
const imageUpload = require("../../middlewares/imageUpload");
const secession = require("./secession");
const checkEmail = require("./checkEmail");
const checkNickName = require("./checkNickName");

router.post("/signUp", signUp, signIn);
router.post("/signIn", signIn);

router.use("/check", auth, check);

router.post("/FBSignUp", FBSignUp, FBSignIn);

router.post("/FBSignIn", FBSignIn);

router.post("/insertDetail", auth, imageUpload, createThumbnail, stringToNumber, insertDetail);

router.post("/modifyDetail", auth, imageUpload, createThumbnail, stringToNumber, modifyDetail);

router.delete("/deleteUser", auth, secession);

router.post("/checkEmail", checkEmail);

router.post("/checkNickName", checkNickName);

module.exports = router;
