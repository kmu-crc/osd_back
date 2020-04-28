const express = require("express");
const router = express.Router();
const signUp = require("./signUp");
const signIn = require("./signIn");
const check = require("./check");
const auth = require("../../middlewares/auth");
const { FBSignIn, FBSignUp } = require("./FBRegistration");
const { insertDetail, modifyDetail,
    insertDesignerDetail, modifyDesignerDetail,
    insertMakerDetail, modifyMakerDetail } = require("./userDetail");
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
const { modifyUserDetail, myPage, myDesign, myGroup, myLikeDesign, myLikeGroup, myLikeDesigner, getMyInvitedList, getMyInvitingList } = require("./myPage");
const { getMyMsgList, getMyMsgDetail, sendMsg, CheckOpponentConnected } = require("./myMsg");
const { findPw } = require("./resetMail");

router.post("/signUp", signUp);
router.post("/signIn", signIn);

router.use("/check", auth, check);

router.post("/FBSignUp", FBSignUp, FBSignIn);

router.post("/FBSignIn", FBSignIn);

// router.post("/insertDetail", auth, insertThumbnail, stringToNumber, stringToBoolean, insertDetail);
router.post("/insertDetail", auth, insertThumbnail, insertDetail);

router.post("/modifyDetail", auth, /*insertThumbnail, stringToNumber, stringToBoolean,*/ modifyDetail);

router.post("/insertDesignerDetail", auth, insertThumbnail, insertDesignerDetail);

router.post("/modifyDesignerDetail", auth, insertThumbnail, modifyDesignerDetail);

router.post("/insertMakerDetail", auth, insertThumbnail, insertMakerDetail);

router.post("/modifyMakerDetail", auth, insertThumbnail, modifyMakerDetail);

router.post("/deleteUser", auth, secession);

router.post("/checkEmail", checkEmail);

router.post("/checkNickName", checkNickName);

router.post("/checkFBUser", checkFBUser);

router.post("/modifyUserDetail/:id", auth, insertThumbnail, modifyUserDetail);
router.get("/myPage", auth, myPage);
router.get("/myPage/design/:page", auth, myDesign, getDesignList);
router.get("/myPage/group/:page", auth, myGroup, getGroupList);
router.get("/myPage/likeDesign/:page", auth, myLikeDesign, getDesignList);
router.get("/myPage/likeDesigner/:page", auth, myLikeDesigner, getDesignerList);
router.get("/myPage/invited", auth, getMyInvitedList, getDesignList);
router.get("/myPage/inviting", auth, getMyInvitingList, getDesignList);

router.get("/msgList", auth, getMyMsgList);
router.get("/msgDetail/:id", auth, getMyMsgDetail);
router.post("/sendMsg/:id", auth, sendMsg);
router.post("/checkOpponent/:id", auth, CheckOpponentConnected)
router.post("/findPw", findPw);
module.exports = router;
