var express = require("express");
var router = express.Router();

var { designList } = require("./designList");
var { designDetail } = require("./designDetail");
var { designView } = require("./designView");
var { designStep, createBoard, designCardDetail } = require("./designStep");
var { designIssue, designIssueDetail } = require("./designIssue");
var auth = require("../../middlewares/auth");
const getDesignList = require("../../middlewares/getDesignList");

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

module.exports = router;
