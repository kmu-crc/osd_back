var express = require("express");
var router = express.Router();
var { designList } = require("./designList");
var { designDetail } = require("./designDetail");
var { designStep } = require("./designStep");
var { designIssue } = require("./designIssue");

router.get("/designList", designList);
router.get("/designList/:level/:category", designList);
router.get("/designDetail/:id", designDetail);
router.get("/designDetail/:id/designStep", designStep);
router.get("/designDetail/:id/designIssue", designIssue);

module.exports = router;
