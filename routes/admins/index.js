const express = require("express");
const router = express.Router();

const adminSignIn = require("./adminSignIn");
const auth = require("../../middlewares/auth");
const getGroupList = require("../../middlewares/getGroupList")
const getDesignList = require("../../middlewares/getDesignList")
const check = require("./check");
const { updateTopGroup, insertTopGroup, deleteTopGroup } = require("../group/topGroupList")
const { allGroupList, getAllGroupTotalCount } = require("../group/allGroupList")
const { updateTopDesign, insertTopDesign, deleteTopDesign } = require("../design/topDesignList")
const { allDesignList, getAllDesignTotalCount } = require("../design/allDesignList")

router.post("/adminSignIn", adminSignIn);
router.post("/check", auth, check);

router.get("/allGroupCount", getAllGroupTotalCount)
router.get("/allGroupList/", allGroupList, getGroupList)
router.post("/:id/updateTopGroup", auth, updateTopGroup)
router.post("/:id/insertTopGroup", auth, insertTopGroup)
router.post("/:id/deleteTopGroup", auth, deleteTopGroup)

router.get("/allDesignCount", getAllDesignTotalCount)
router.get("/allDesignList/", allDesignList, getDesignList)
router.post("/:id/updateTopDesign", auth, updateTopDesign)
router.post("/:id/insertTopDesign", auth, insertTopDesign)
router.post("/:id/deleteTopDesign", auth, deleteTopDesign)
module.exports = router;



// const createCountry = require("./createCountry");
// const createSido = require("./createSido");
// const { createCategoryLevel1, createCategoryLevel2 } = require("./createCategory");
// router.post("/createCountry", auth, adminAuth, createCountry);
// router.post("/createSido", auth, adminAuth, createSido);
//  router.post("/createCategoryLevel2", auth, adminAuth, createCategoryLevel2);
// router.post("/createCategoryLevel1", auth, adminAuth, createCategoryLevel1);