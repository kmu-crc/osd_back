const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");

const { RequestList, RequestListCount, ExtendRequestList } = require("./list");
const { RequestDetail } = require("./detail");
const { CreateRequest, UpdateRequest, deleteRequest, GetRequest, GetDesignerRequest, GetMakerRequest, GetMyDesignerRequest, GetMyMakerRequest } = require("./request");
const { GetComment, RemoveComment, CreateComment } = require("./comment");

// router.get("/list/:page/:sorting?/:cate1?/:cate2?/:keyword?/:private?", RequestList, ExtendRequestList);
router.get("/count/:cate1?/:cate2?/:keyword?/:private?", RequestListCount);
router.get("/detail/:id", RequestDetail);
router.get("/comment/:id", GetComment);
router.delete("/comment-remove/:id", auth, RemoveComment);
router.post("/comment-create/:id", auth, CreateComment);

router.post("/create", auth, CreateRequest);
router.post("/update/:id", auth, UpdateRequest);
router.delete("/delete/:id", auth, deleteRequest);
router.get("/list/:type/:page/:cate1?/:cate2?/:cate3?/:sort?/:keyword?", GetRequest);
router.get("/designer-list/:id/:page/", GetDesignerRequest);
router.get("/maker-list/:id/:page/", GetMakerRequest);
router.get("/My-designer-list/:id/:page/", GetMyDesignerRequest);
router.get("/My-maker-list/:id/:page/", GetMyMakerRequest);


module.exports = router;
