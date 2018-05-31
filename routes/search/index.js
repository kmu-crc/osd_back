const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const searchMembers = require("./searchMembers");

router.post("/members", auth, searchMembers);

module.exports = router;
