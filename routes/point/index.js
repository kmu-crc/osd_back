const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
// const tokenDecoded = require("../../middlewares/tokenDecoded");
const { GetPoint, GetHistory, PointUp } = require("./point");

router.get("/get/:id", auth, GetPoint);
router.get("/get-history/:id/:page", auth, GetHistory);
router.post("/up", auth, PointUp);

module.exports = router;

