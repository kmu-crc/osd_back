const express = require("express");
const router = express.Router();
const { getCategoryLevel1, getCategoryLevel2, getCategoryAll } = require("./getCategory");

router.get("/getCategoryLevel1", getCategoryLevel1);
router.get("/getCategoryLevel2/:id", getCategoryLevel2);
router.get("/getCategoryAll", getCategoryAll);

module.exports = router;
