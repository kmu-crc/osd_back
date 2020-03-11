const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const stringToNumber = require("../../middlewares/stringToNumber");

const { galleryList,galleryItemList } = require("./galleryList");
const { galleryDetail } = require("./galleryDetail");
const getItemList = require("../../middlewares/getItemList");


router.get("/gallerylist/:id/:page",galleryList);
router.get("/galleryItemList/:id/:page",galleryItemList,getItemList);
router.get("/galleryDetail/:id",galleryDetail);


module.exports = router;
