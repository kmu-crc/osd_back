const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const tokenDecoded = require("../../middlewares/tokenDecoded");
const { GetPayment, GetMyPayment, GetMyRequestItem, RemovePayment, ConfirmThisItemPurchased, GetThisItemPurchased, CreatePayment } = require("./payment");

// payment
router.get("/get/:id/:page", auth, GetPayment);
router.get("/getmine/:page", auth, GetMyPayment);
router.get("/getmine-request-item/:page", auth, GetMyRequestItem);
router.post("/create/:id", auth, CreatePayment);

router.get("/is-purchased/:id", auth, GetThisItemPurchased);
router.post("/confirm-purchased/:id", auth, ConfirmThisItemPurchased);

module.exports = router;
