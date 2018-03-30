var express = require("express");
var router = express.Router();

var { designerList } = require("./designerList");

router.get("/designerList", designerList);

module.exports = router;
