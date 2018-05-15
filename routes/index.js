const express = require("express");
const router = express.Router();
const users = require("./users");
const design = require("./design");
const group = require("./group");
const designer = require("./designer");
const categorys = require("./categorys");
const admins = require("./admins");

/* GET home page. */
router.use("/users", users);
router.use("/design", design);
router.use("/admins", admins);
router.use("/group", group);
router.use("/designer", designer);
router.use("/categorys", categorys);

module.exports = router;
