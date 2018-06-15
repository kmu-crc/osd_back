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
const { updateGroup } = require("./updateGroup");
const { waitingDesign, waitingGroup } = require("./waitingList");
const insertThumbnail = require("../../middlewares/insertThumbnail");
const { myDesignList, myGroupList } = require("./getMyList");
const { acceptDesign, acceptGroup, deleteDesign, deleteGroup } = require("./manageGroup");

router.get("/groupList/:page/:sorting?", groupList, getGroupList);
router.get("/groupDetail/:id", groupDetail);
router.get("/groupDetail/:id/design/:page/:sorting?", designInGroup, getDesignList);
router.get("/groupDetail/:id/group/:page/:sorting?", groupInGroup, getGroupList);

router.post("/groupSignUp", auth, groupSignUp);

router.get("/:id/join/myDesignList", auth, myDesignList);
router.get("/:id/join/myGroupList", auth, myGroupList);
router.post("/groupDetail/:id/DesignJoinGroup", auth, groupSignUp);
router.post("/groupDetail/:id/GroupJoinGroup", auth, groupSignUpGroup);
router.get("/groupDetail/:id/waitingDesign/:sorting?", waitingDesign, getDesignList);
router.get("/groupDetail/:id/waitingGroup/:sorting?", waitingGroup, getGroupList);
router.post("/groupDetail/:id/acceptDesign/:designId", acceptDesign);
router.post("/groupDetail/:id/acceptGroup/:groupId", acceptGroup);
router.delete("/groupDetail/:id/deleteDesign/:designId", deleteDesign);
router.delete("/groupDetail/:id/deleteGroup/:groupId", deleteGroup);

router.post("/createGroup", auth, insertThumbnail, stringToNumber, createGroup);
router.post("/:id/updateGroup", auth, insertThumbnail, stringToNumber, updateGroup);

module.exports = router;
