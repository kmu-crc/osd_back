var express = require("express");
var router = express.Router();
var { designList } = require("./designList");
var { designDetail } = require("./designDetail");
var { designStep, createBoard, designCardDetail } = require("./designStep");
var { designIssue } = require("./designIssue");

router.get("/designList", designList);
router.get("/designList/:level/:category", designList);
router.get("/designDetail/:id", designDetail);
router.get("/designDetail/:id/step", designStep);
router.get("/designDetail/:id/createBoard", createBoard);
router.get("/designDetail/:id/cardDetail/:card_id", designCardDetail);
router.get("/designDetail/:id/issue", designIssue);

module.exports = router;
