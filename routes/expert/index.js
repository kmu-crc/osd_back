const express = require("express");
const router = express.Router();

// const auth = require("../../middlewares/auth");
// const { designerList, getTotalCount } = require("./designerList");
// const { designerDetail, getCount } = require("./designerDetail");
const getDesignerList = require("../../middlewares/getDesignerList");
// const { myDesignInDesigner, designInDesigner, likeInDesigner } = require("./designInDesigner");
// const getDesignList = require("../../middlewares/getDesignList");
// const { getLikeDesigner, likeDesigner, unlikeDesigner } = require("./likeDesigner");
const { getTopList } = require("./topList");

// router.get("/designerList/:page/:sorting?/:cate1?/:cate2?/:keyword?", designerList, getDesignerList);
// router.get("/designerCount/:cate1?/:cate2?", getTotalCount);
// router.get("/designerDetail/:id", designerDetail);
// router.get("/designerDetail/:id/myDesign/:page", myDesignInDesigner, getDesignList);
// router.get("/designerDetail/:id/design/:page", designInDesigner, getDesignList);
// router.get("/designerDetail/:id/like/:page", likeInDesigner, getDesignList);

// router.get("/getLike/:id", auth, getLikeDesigner);
// router.post("/like/:id", auth, likeDesigner);
// router.post("/unlike/:id", auth, unlikeDesigner);

// router.get("/getCount/:id", getCount);

router.get("/TopList", getTopList, getDesignerList);

module.exports = router;
