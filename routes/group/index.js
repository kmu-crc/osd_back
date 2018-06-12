const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const stringToNumber = require("../../middlewares/stringToNumber");
const getDesignList = require("../../middlewares/getDesignList");
const getGroupList = require("../../middlewares/getGroupList");

const { groupList } = require("./groupList");
const { groupDetail } = require("./groupDetail");
const { designInGroup } = require("./designInGroup");
const { groupInGroup } = require("./groupInGroup");
const { groupSignUp, groupSignUpGroup } = require("./groupSignUp");
const { createGroup } = require("./createGroup");
const { waitingDesign, waitingGroup } = require("./waitingList");
const insertThumbnail = require("../../middlewares/insertThumbnail");
const { myDesignList, myGroupList } = require("./getMyList");

router.get("/groupList/:page/:sorting?", groupList, getGroupList);
router.get("/groupDetail/:id", groupDetail);
router.get("/groupDetail/:id/design/:page/:sorting?", designInGroup, getDesignList);
router.get("/groupDetail/:id/group/:page/:sorting?", groupInGroup, getGroupList);
router.get("/:id/join/myDesignList", auth, myDesignList);
router.get("/:id/join/myGroupList", auth, myGroupList);
router.post("/groupDetail/:id/DesignJoinGroup", auth, groupSignUp);
router.post("/groupDetail/:id/GroupJoinGroup", auth, groupSignUpGroup);
router.get("/groupDetail/:id/waitingDesign", waitingDesign, getDesignList);
router.get("/groupDetail/:id/waitingGroup", waitingGroup, getGroupList);
router.post("/createGroup", auth, insertThumbnail, stringToNumber, createGroup);

module.exports = router;
