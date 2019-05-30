const express = require("express")
const router = express.Router()

const adminSignIn = require("./adminSignIn")
const auth = require("../../middlewares/auth")
const check = require("./check")

const getGroupList = require("../../middlewares/getGroupList")
const { updateTopGroup, insertTopGroup, deleteTopGroup } = require("../group/topGroupList")
const { allGroupList, getAllGroupTotalCount } = require("../group/allGroupList")

const getDesignList = require("../../middlewares/getDesignList")
const { updateTopDesign, insertTopDesign, deleteTopDesign } = require("../design/topDesignList")
const { allDesignList, getAllDesignTotalCount } = require("../design/allDesignList")

const { /*updateNotice, insertNotice,*/ deleteNotice, getNoticeList } = require("../admins/notice")

router.post("/adminSignIn", adminSignIn)
router.post("/check", auth, check)

router.get("/allGroupCount", getAllGroupTotalCount)
router.get("/allGroupList/", allGroupList, getGroupList)
router.post("/:id/insertTopGroup", auth, insertTopGroup)
router.post("/:id/updateTopGroup", auth, updateTopGroup)
router.post("/:id/deleteTopGroup", auth, deleteTopGroup)

router.get("/allDesignCount", getAllDesignTotalCount)
router.get("/allDesignList/", allDesignList, getDesignList)
router.post("/:id/insertTopDesign", auth, insertTopDesign)
router.post("/:id/updateTopDesign", auth, updateTopDesign)
router.post("/:id/deleteTopDesign", auth, deleteTopDesign)

router.get("/getNoticeList/", getNoticeList)
// router.post("/:id/insertNotice", auth, insertNotice)
// router.post("/:id/updateNotice", auth, updateNotice)
router.post("/:id/deleteNotice", auth, deleteNotice)

module.exports = router
