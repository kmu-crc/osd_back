const express = require("express");
const router = express.Router();
const users = require("./users");
const design = require("./design");
const product = require("./product");
const group = require("./group");
const designer = require("./designer");
const categorys = require("./categorys");
const admins = require("./admins");
const search = require("./search");
const common = require("./common");

//prototype
const maker = require("./maker");
const request = require("./request");
const expert = require("./expert");
const item = require("./item");
const point = require("./point");

/* GET home page. */
router.use("/common", common);
router.use("/users", users);
router.use("/design", design);
router.use("/product", product);
router.use("/admins", admins);
router.use("/group", group);
router.use("/designer", designer);
router.use("/categorys", categorys);
router.use("/search", search);

router.use("/maker", maker);
router.use("/request", request);
router.use("/expert", expert);
router.use("/item", item);
router.use("/point", point);

module.exports = router;
