const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const imageUpload = require("../../middlewares/imageUpload");
const createThumbnail = require("../../middlewares/createThumbnail");
const stringToNumber = require("../../middlewares/stringToNumber");

const { groupList } = require("./groupList");
const { groupDetail } = require("./groupDetail");
const { designInGroup } = require("./designInGroup");
const { groupInGroup } = require("./groupInGroup");
const groupSignUp = require("./groupSignUp");
const { createGroup } = require("./createGroup");

router.get("/groupList", groupList);
router.get("/groupDetail/:id", groupDetail);
router.get("/groupDetail/:id/design/:sorting?", designInGroup);
router.get("/groupDetail/:id/group/:sorting?", groupInGroup);
router.post("/groupSignUp", auth, groupSignUp);
router.post("/createGroup", auth, createThumbnail, stringToNumber, createGroup);

module.exports = router;
