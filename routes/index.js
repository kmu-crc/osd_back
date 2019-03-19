const express = require("express");
const router = express.Router();
const admins = require("./admins");
const users = require("./users");
const design = require("./design");
const group = require("./group");
const designer = require("./designer");
const categorys = require("./categorys");
const search = require("./search");

/* GET home page. */
router.use("/admins", admins);
router.use("/users", users);
router.use("/design", design);
router.use("/group", group);
router.use("/designer", designer);
router.use("/categorys", categorys);
router.use("/search", search);

module.exports = router;
