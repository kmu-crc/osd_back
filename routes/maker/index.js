const express = require("express");
const router = express.Router();
// const auth = require("../../middlewares/auth");
const { makerList, getTotalCount } = require("./list");
const { makerDetail } = require("./detail");
const getExpertList = require("../../middlewares/getExpertList");
// const { getTopList } = require("./topList");
const getMakerList = require("../../middlewares/getMakerList");

router.get("/list/:page/:sorting?/:cate1?/:cate2?/:keyword?", makerList, getMakerList);
router.get("/list-count/:cate1?/:cate2?", getTotalCount);
router.get("/detail/:id", makerDetail);
// router.get("/maker-count/:id", getCount);
// router.get("/TopList/:page", getTopList, getDesignerList);

module.exports = router;