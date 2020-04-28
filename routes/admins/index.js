const express = require("express")
const router = express.Router()

const adminSignIn = require("./adminSignIn")
const auth = require("../../middlewares/auth")
const check = require("./check")
const getItemList = require("../../middlewares/getItemList");
const getGroupList = require("../../middlewares/getGroupList");
const getExpertList = require("../../middlewares/getExpertList");
const getDesignList = require("../../middlewares/getDesignList");
const getDesignerList = require("../../middlewares/getDesignerList");

const { updateTopGroup, insertTopGroup, deleteTopGroup } = require("../group/topGroupList")
const { allGroupList, getAllGroupTotalCount } = require("../group/allGroupList")

// const { updateTopDesign, insertTopDesign, deleteTopDesign } = require("../design/topDesignList")
const { allDesignList, getAllDesignTotalCount } = require("../design/allDesignList")
const { updateNotice, insertNotice, deleteNotice, getNoticeList } = require("../admins/notice")

//item
const { updateTopDesign, insertTopDesign, deleteTopDesign } = require("../design/topDesignList")
const { TopItemList } = require("./item");
const { ItemList, ItemListCount, DeleteItem } = require("./item");
// const { TopDesignList, TopDesignListCount, DesignList, DesignListCount, DeleteDesign } = require("./item");
const { TopExpertList, insertTopExpert, updateTopExpert, deleteTopExpert } = require("./expert");

// designer
const { DesignerList, DesignerListCount, DeleteDesigner } = require("./designer");
// maker 
const { MakerList, MakerListCount, DeleteMaker } = require("./maker");


router.post("/adminSignIn", adminSignIn)
router.post("/check", auth, check)

router.get("/allGroupCount", getAllGroupTotalCount)
router.get("/allGroupList/", allGroupList, getGroupList)
router.post("/:id/insertTopGroup", auth, insertTopGroup)
router.post("/:id/updateTopGroup", auth, updateTopGroup)
router.post("/:id/deleteTopGroup", auth, deleteTopGroup)

router.get("/allDesignCount", getAllDesignTotalCount)
router.get("/allDesignList/", allDesignList, getDesignList)

router.get("/getNoticeList/", getNoticeList)
router.post("/insertNotice", auth, insertNotice)
router.post("/updateNotice", auth, updateNotice)
router.post("/:id/deleteNotice", auth, deleteNotice)

//item
router.get("/TopItemList/", auth, TopItemList, getItemList);
router.post("/:id/insertTopDesign", auth, insertTopDesign);
router.post("/:id/updateTopDesign", auth, updateTopDesign);
router.post("/:id/deleteTopDesign", auth, deleteTopDesign);
router.get("/ItemList/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, ItemList, getItemList);
router.get("/ItemListCount/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, ItemListCount);
router.delete("/DeleteItem/:id", auth, DeleteItem);

// expert
router.get("/TopExpertList/", auth, TopExpertList, getExpertList);
router.post("/:id/:type/insertTopExpert", auth, insertTopExpert);
router.post("/:id/:type/updateTopExpert", auth, updateTopExpert);
router.post("/:id/:type/deleteTopExpert", auth, deleteTopExpert);

// designer
router.get("/DesignerList/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, DesignerList, getDesignerList);
router.get("/DesignerListCount/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, DesignerListCount);
router.delete("/DeleteDesigner/:id", auth, DeleteDesigner);

// maker
router.get("/MakerList/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, MakerList, getDesignerList);
router.get("/MakerListCount/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, MakerListCount);
router.delete("/DeleteMaker/:id", auth, DeleteMaker);

module.exports = router
