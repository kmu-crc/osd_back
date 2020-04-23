const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const getDesignerList = require("../../middlewares/getDesignerList");
const getDesignList = require("../../middlewares/getDesignList");
const getGroupList = require("../../middlewares/getGroupList");
const { getLikeDesigner, likeDesigner, unlikeDesigner } = require("./likeDesigner");
const { allDesignInDesigner, myDesignInDesigner, designInDesigner, likeInDesigner } = require("./designInDesigner");
const { getTopList } = require("./topList");
const { designerDetail, getCount } = require("./designerDetail");
const { designerList, getTotalCount } = require("./designerList");
const { myGroup, relatedGroup, likeGroup, designersLikeDesigner } = require("./designerDetailPage");

router.get("/designerList/:page/:sorting?/:cate1?/:cate2?/:keyword?", designerList, getDesignerList);
router.get("/designerCount/:cate1?/:cate2?", getTotalCount);
router.get("/designerDetail/:id", designerDetail);

router.get("/designerDetail/:id/myDesign/:page/:sort?", myDesignInDesigner, getDesignList);
router.get("/designerDetail/:id/design/:page/:sort?", designInDesigner, getDesignList);
router.get("/designerDetail/:id/allDesignDesigner/:page/:sort?", allDesignInDesigner, getDesignList);
router.get("/designerDetail/:id/like/:page/:sort?", likeInDesigner, getDesignList);

router.get("/designerDetail/:id/myGroup/:page/:sort?", myGroup, getGroupList);
router.get("/designerDetail/:id/relatedGroup/:page/:sort?", relatedGroup, getGroupList);
router.get("/designerDetail/:id/likeGroup/:page/:sort?", likeGroup, getGroupList);
router.get("/designerDetail/:id/likeDesigner/:page/:sort?", designersLikeDesigner, getDesignerList);

router.get("/getLike/:id", auth, getLikeDesigner);
router.post("/like/:id", auth, likeDesigner);
router.post("/unlike/:id", auth, unlikeDesigner);

router.get("/getCount/:id", getCount);

// top 5개 리스트 가져오기 (메인용)
router.get("/TopList/:page", getTopList, getDesignerList);

module.exports = router;
