const express = require("express");
const router = express.Router();
// const auth = require("../../middlewares/auth");
const { makerList, getTotalCount,getMakerCount } = require("./list");
const { makerDetail, getMakerReview, getMakerReviewCount } = require("./detail");
// const getExpertList = require("../../middlewares/getExpertList");
// const { getTopList } = require("./topList");
const getMakerList = require("../../middlewares/getMakerList");

router.get("/list/:page/:sorting?/:cate1?/:cate2?/:keyword?", makerList, getMakerList);
router.get("/getMakerCount/:sorting?/:cate1?/:cate2?/:keyword?", getMakerCount);

router.get("/list-count/:cate1?/:cate2?", getTotalCount);
router.get("/detail/:id", makerDetail);
// router.get("/maker-count/:id", getCount);
// router.get("/TopList/:page", getTopList, getDesignerList);

router.get("/get-review/:id/:page", getMakerReview);
router.get("/get-review-count/:id", getMakerReviewCount);

module.exports = router;