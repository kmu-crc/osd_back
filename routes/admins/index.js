const express = require("express");
const router = express.Router();

const adminSignIn = require("./adminSignIn");
const auth = require("../../middlewares/auth");
const getGroupList = require("../../middlewares/getGroupList");
const check = require("./check");
const { updateTopGroup, insertTopGroup, deleteTopGroup} = require("../group/topGroupList");
const { allGroupList, getAllGroupTotalCount } = require("../group/allGroupList");


router.post("/adminSignIn", adminSignIn);
router.post("/check", auth, check); 

router.get("/allGroupCount", getAllGroupTotalCount);
router.get("/allGroupList/", allGroupList, getGroupList);
router.post("/:id/updateTopGroup", auth, updateTopGroup);
router.post("/:id/insertTopGroup",auth, insertTopGroup);
router.post("/:id/deleteTopGroup",auth, deleteTopGroup);

module.exports = router;



// const createCountry = require("./createCountry");
// const createSido = require("./createSido");
// const { createCategoryLevel1, createCategoryLevel2 } = require("./createCategory");
// router.post("/createCountry", auth, adminAuth, createCountry);
// router.post("/createSido", auth, adminAuth, createSido);
//  router.post("/createCategoryLevel2", auth, adminAuth, createCategoryLevel2);
// router.post("/createCategoryLevel1", auth, adminAuth, createCategoryLevel1);