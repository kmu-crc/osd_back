const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const adminAuth = require("../../middlewares/adminAuth");
const createCountry = require("./createCountry");
const createSido = require("./createSido");
const { createCategoryLevel1, createCategoryLevel2 } = require("./createCategory");

router.post("/createCountry", auth, adminAuth, createCountry);
router.post("/createSido", auth, adminAuth, createSido);
router.post("/createCategoryLevel1", auth, adminAuth, createCategoryLevel1);
router.post("/createCategoryLevel2", auth, adminAuth, createCategoryLevel2);

module.exports = router;
