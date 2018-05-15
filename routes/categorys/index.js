const express = require("express");
const router = express.Router();
const { getCategoryLevel1, getCategoryLevel2 } = require("./getCategory");

router.get("/getCategoryLevel1", getCategoryLevel1);
router.get("/getCategoryLevel2/:id", getCategoryLevel2);

module.exports = router;
