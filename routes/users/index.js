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
const checkFBUser = require("./checkFBUser");
const test = require("./test");
const multipleUpload = require("../../middlewares/multipleUpload");
const getDesignList = require("../../middlewares/getDesignList");
const getGroupList = require("../../middlewares/getGroupList");
const getDesignerList = require("../../middlewares/getDesignerList");
const { myPage, myDesign, myGroup, myLikeDesign, myLikeGroup, myLikeDesigner } = require("./myPage");

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

router.post("/checkFBUser", checkFBUser);

router.post("/test", multipleUpload, test);

router.get("/myPage", auth, myPage);
router.get("/myPage/design/:sort?", auth, myDesign, getDesignList);
router.get("/myPage/group/:sort?", auth, myGroup, getGroupList);
router.get("/myPage/like/design/:sort?", auth, myLikeDesign, getDesignList);
router.get("/myPage/like/group/:sort?", auth, myLikeGroup, getGroupList);
router.get("/myPage/like/designer/:sort?", auth, myLikeDesigner, getDesignerList);

module.exports = router;
