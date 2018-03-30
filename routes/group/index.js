var express = require("express");
var router = express.Router();

var { groupList } = require("./groupList");
var { groupDetail } = require("./groupDetail");

router.get("/groupList", groupList);
router.get("/groupDetail/:id", groupDetail);

module.exports = router;
