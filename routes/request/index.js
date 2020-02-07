const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");

const { RequestList, RequestListCount, ExtendRequestList } = require("./List");
const { RequestDetail } = require("./Detail");
const { CreateRequest } = require("./Request");
const { GetComment, RemoveComment, CreateComment } = require("./Comment");

router.get("/list/:page/:sorting?/:cate1?/:cate2?/:keyword?/:private?", RequestList, ExtendRequestList);
router.get("/count/:cate1?/:cate2?/:keyword?/:private?", RequestListCount);
router.get("/detail/:id", RequestDetail);
router.post("/create", auth, CreateRequest);
router.get("/comment/:id", GetComment);
router.delete("/comment-remove/:id", auth, RemoveComment);
router.post("/comment-create/:id", auth, CreateComment);

module.exports = router;