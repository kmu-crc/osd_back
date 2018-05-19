var express = require("express");
var router = express.Router();

var { designerList } = require("./designerList");
var { designerDetail } = require("./designerDetail");
const getDesignerList = require("../../middlewares/getDesignerList");

router.get("/designerList", designerList, getDesignerList);
router.get("/designerDetail/:id", designerDetail);

module.exports = router;
