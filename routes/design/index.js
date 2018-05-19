const express = require("express");
const router = express.Router();

const { designList } = require("./designList");
const { designDetail } = require("./designDetail");
const { designView } = require("./designView");
const { designStep, createBoard, designCardDetail } = require("./designStep");
const { designIssue, designIssueDetail } = require("./designIssue");
const auth = require("../../middlewares/auth");
const getDesignList = require("../../middlewares/getDesignList");
const { createDesign } = require("./createDesign");
const uploadDesign = require("../../middlewares/uploadDesign");
const stringToNumber = require("../../middlewares/stringToNumber");

// router.use("/designList", auth);
router.get("/designList", designList, getDesignList);
// router.use("/designDetail/:id", auth);
router.get("/designDetail/:id", designDetail);
router.get("/designDetail/:id/view", designView);
router.get("/designDetail/:id/step", designStep);
router.post("/designDetail/:id/createBoard", createBoard);
router.get("/designDetail/:id/cardDetail/:card_id", designCardDetail);
router.get("/designDetail/:id/issue", designIssue);
router.get("/designDetail/:id/issueDetail/:issue_id", designIssueDetail);

router.post("/createDesign", auth, uploadDesign, stringToNumber, createDesign);

module.exports = router;
