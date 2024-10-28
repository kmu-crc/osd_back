const express = require("express");
const router = express.Router();
const users = require("./users");
const design = require("./design");
const group = require("./group");
const designer = require("./designer");
const categorys = require("./categorys");
const admins = require("./admins");
const search = require("./search");
const common = require("./common")
const upload = require("./fileupload");
// const videochat = require("./vchat");
const chat = require("./chat");

/* GET home page. */
router.use("/common", common)
router.use("/users", users);
router.use("/design", design);
router.use("/admins", admins);
router.use("/group", group);
router.use("/designer", designer);
router.use("/categorys", categorys);
router.use("/search", search);
router.use("/chat", chat);

router.use("/upload", upload);

module.exports = router;
