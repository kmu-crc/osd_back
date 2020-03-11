const express = require("express");
const router = express.Router();
const { getCategory } = require("./getCategory");

router.get("/getCategory", getCategory);

module.exports = router;
