const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
// const { designerList, getTotalCount } = require("./designerList");
const { designerDetail,makerDetail,designerViewDetail,makerViewDetail } = require("./detail");
const getDesignerList = require("../../middlewares/getDesignerList");
const getMakerList = require("../../middlewares/getMakerList");

// const { myDesignInDesigner, designInDesigner, likeInDesigner } = require("./designInDesigner");
// const getDesignList = require("../../middlewares/ㅔgetDesignList");
// const { getLikeDesigner, likeDesigner, unlikeDesigner } = require("./likeDesigner");
const { getTopList } = require("./topList");
const { likeDesigner, unlikeDesigner, likeMaker, unlikeMaker,getLikeDesigner,getLikeMaker,likeInDesigner,likeInMaker } = require("./like");


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
router.get("/designerDetail/:id",designerDetail);
router.get("/makerDetail/:id",makerDetail);
router.get("/designerViewDetail/:id",designerViewDetail);
router.get("/makerViewDetail/:id",makerViewDetail);

router.post("/likeDesigner/:id", auth, likeDesigner);
router.post("/unlikeDesigner/:id", auth, unlikeDesigner);
router.get("/getLikeDesigner/:id", auth, getLikeDesigner);


router.post("/likeMaker/:id", auth, likeMaker);
router.post("/unlikeMaker/:id", auth, unlikeMaker);
router.get("/getLikeMaker/:id", auth, getLikeMaker);

router.get("/designerDetail/:id/like/:page", likeInDesigner, getDesignerList);
router.get("/makerDetail/:id/like/:page", likeInMaker, getMakerList);




module.exports = router;
