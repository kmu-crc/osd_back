const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const searchMembers = require("./searchMembers");
const { searchIssue } = require("./searchIssue");

router.post("/members/:id?", auth, searchMembers);
router.get("/:id/designIssue/:keyword", searchIssue);

module.exports = router;
