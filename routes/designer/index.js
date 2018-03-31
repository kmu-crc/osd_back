var express = require("express");
var router = express.Router();

var { designerList } = require("./designerList");
var { designerDetail } = require("./designerDetail");

router.get("/designerList", designerList);
router.get("/designerDetail/:id", designerDetail);

module.exports = router;
