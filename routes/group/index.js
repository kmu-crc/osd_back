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
const groupSignUp = require("./groupSignUp");
const { createGroup } = require("./createGroup");
const { waitingDesign, waitingGroup } = require("./waitingList");

router.get("/groupList/:page/:sorting?", groupList, getGroupList);
router.get("/groupDetail/:id", groupDetail);
router.get("/groupDetail/:id/design/:page/:sorting?", designInGroup, getDesignList);
router.get("/groupDetail/:id/group/:page/:sorting?", groupInGroup, getGroupList);
router.post("/groupSignUp", auth, groupSignUp);
router.get("/groupDetail/:id/waitingDesign", waitingDesign, getDesignList);
router.get("/groupDetail/:id/waitingGroup", waitingGroup, getGroupList);
// router.post("/createGroup", auth, createThumbnail, stringToNumber, createGroup);

module.exports = router;
