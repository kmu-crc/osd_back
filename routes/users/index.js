const express = require("express");
const router = express.Router();
const signUp = require("./signUp");
const signIn = require("./signIn");
const check = require("./check");
const auth = require("../../middlewares/auth");
const { FBSignIn, FBSignUp } = require("./FBRegistration");
const { insertDetail, modifyDetail } = require("./userDetail");
const stringToNumber = require("../../middlewares/stringToNumber");
const stringToBoolean = require("../../middlewares/stringToBoolean");
const insertThumbnail = require("../../middlewares/insertThumbnail");
const secession = require("./secession");
const checkEmail = require("./checkEmail");
const checkNickName = require("./checkNickName");
const checkFBUser = require("./checkFBUser");
const getDesignList = require("../../middlewares/getDesignList");
const getGroupList = require("../../middlewares/getGroupList");
const getDesignerList = require("../../middlewares/getDesignerList");
const { myPage, myAllDesign, myDesign, myGroup, inGroup, myLikeDesign, myLikeGroup, myLikeDesigner, getMyInvitedList, getMyInvitingList } = require("./myPage");
const { getMyMsgList, getMyMsgDetail, sendMsg } = require("./myMsg");
const { findPw } = require("./resetMail");

router.post("/signUp", signUp, signIn);
router.post("/signIn", signIn);

router.use("/check", auth, check);

router.post("/FBSignUp", FBSignUp, FBSignIn);

router.post("/FBSignIn", FBSignIn);

router.post("/insertDetail", auth, insertThumbnail, stringToNumber, stringToBoolean, insertDetail);

router.post("/modifyDetail", auth, insertThumbnail, stringToNumber, stringToBoolean, modifyDetail);

router.post("/deleteUser", auth, secession);

router.post("/checkEmail", checkEmail);

router.post("/checkNickName", checkNickName);

router.post("/checkFBUser", checkFBUser);

router.get("/myPage", auth, myPage);
router.get("/myPage/design/:page", auth, myDesign, getDesignList);
router.get("/myPage/allDesign/:page", auth, myAllDesign, getDesignList);
router.get("/myPage/group/:page", auth, myGroup, getGroupList);
router.get("/myPage/inGroup/:page", auth, inGroup, getGroupList);
router.get("/myPage/likeDesign/:page", auth, myLikeDesign, getDesignList);
router.get("/myPage/likeDesigner/:page", auth, myLikeDesigner, getDesignerList);
router.get("/myPage/likeGroup/:page", auth, myLikeGroup, getGroupList);
router.get("/myPage/invited", auth, getMyInvitedList, getDesignList);
router.get("/myPage/inviting", auth, getMyInvitingList, getDesignList);

router.get("/msgList", auth, getMyMsgList);
router.get("/msgDetail/:id", auth, getMyMsgDetail);
router.post("/sendMsg/:id", auth, sendMsg);

router.post("/findPw", findPw);
module.exports = router;
