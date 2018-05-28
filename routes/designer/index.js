const express = require("express");
const router = express.Router();

const { designerList } = require("./designerList");
const { designerDetail } = require("./designerDetail");
const getDesignerList = require("../../middlewares/getDesignerList");
const { designInDesigner, likeInDesigner } = require("./designInDesigner");
const getDesignList = require("../../middlewares/getDesignList");

router.get("/designerList", designerList, getDesignerList);
router.get("/designerDetail/:id", designerDetail);
router.get("/designerDetail/:id/design", designInDesigner, getDesignList);
router.get("/designerDetail/:id/like", likeInDesigner, getDesignList);

module.exports = router;
