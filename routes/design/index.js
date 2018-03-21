var express = require("express");
var router = express.Router();
var { designList } = require("./designList");
var { designDetail } = require("./designDetail");

router.get("/designList", designList);
router.get("/designList/:level/:category", designList);
router.get("/designDetail/:id", designDetail);

module.exports = router;
