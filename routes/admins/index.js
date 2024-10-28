const express = require("express")
const router = express.Router()

//auth
const adminSignIn = require("./adminSignIn")
const auth = require("../../middlewares/auth")
const check = require("./check")

//group
const getGroupList = require("../../middlewares/getGroupList")
const { updateTopGroup, insertTopGroup, deleteTopGroup } = require("../group/topGroupList")
const { TopGroupList, TopGroupListCount, GroupList, GroupListCount, DeleteGroup } = require("./group");

//design
const getDesignList = require("../../middlewares/getDesignList")
const { updateTopDesign, insertTopDesign, deleteTopDesign } = require("../design/topDesignList")
const { TopDesignList, TopDesignListCount, DesignList, DesignListCount, DeleteDesign } = require("./design");

//designer
const getDesignerList = require("../../middlewares/getDesignerList")
const { DesignerList, DesignerListCount, DeleteDesigner } = require("./designer");

//notice
const { updateNotice, insertNotice, deleteNotice, getNoticeList } = require("../admins/notice")



// auth
router.post("/adminSignIn", adminSignIn)
router.post("/check", auth, check)

// group
router.get("/GroupList/:page/:max/:sort/:desc/:start/:end/:keyword?", auth, GroupList, getGroupList);
router.get("/GroupListCount/:page/:max/:sort/:desc/:start/:end/:keyword?", auth, GroupListCount);
router.delete("/DeleteGroup/:id", auth, DeleteGroup);
// top group
router.get("/TopGroupList/", auth, TopGroupList, getGroupList);
router.get("/TopGroupListCount", TopGroupListCount);
router.post("/:id/insertTopGroup", auth, insertTopGroup)
router.post("/:id/updateTopGroup", auth, updateTopGroup)
router.post("/:id/deleteTopGroup", auth, deleteTopGroup)

// design
router.get("/DesignList/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, DesignList, getDesignList);
router.get("/DesignListCount/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, DesignListCount);
router.delete("/DeleteDesign/:id", auth, DeleteDesign);
// top design
router.get("/TopDesignList/", auth, TopDesignList, getDesignList);
router.get("/TopDesignListCount", TopDesignListCount);
router.post("/:id/insertTopDesign", auth, insertTopDesign)
router.post("/:id/updateTopDesign", auth, updateTopDesign)
router.post("/:id/deleteTopDesign", auth, deleteTopDesign)

// designer
router.get("/DesignerList/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, DesignerList, getDesignerList);
router.get("/DesignerListCount/:page/:max/:cate1/:cate2/:sort/:desc/:start/:end/:keyword?", auth, DesignerListCount);
router.delete("/DeleteDesigner/:id", auth, DeleteDesigner);
// notice
router.get("/getNoticeList/", getNoticeList)
router.post("/insertNotice", auth, insertNotice)
router.post("/updateNotice", auth, updateNotice)
router.post("/:id/deleteNotice", auth, deleteNotice)

module.exports = router
