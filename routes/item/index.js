const express = require("express");
const axios = require("axios");
const router = express.Router();
const tokenDecoded = require("../../middlewares/tokenDecoded");
const getItemList = require("../../middlewares/getItemList");
const insertThumbnail = require("../../middlewares/insertThumbnail");
const { itemList, getTotalCount, getItemCount, getTopList, getUploadItemList, getMyProjectItemList, updateListHeader, updateItemList, deleteItemList, createItemList } = require("./list");
const { itemDetail, additionItemDetail, getItemReivew, getItemReviewTotalCount, itemCard, itemStep, itemStep2,itemStep3, HaveInItem, updateCardInfo, updateCardSource, createItemCard } = require("./detail");
const { createItem, updateItem, deleteItem } = require("./create");
const { updateItemContent, deleteItemCard } = require("./itemCard");
const { GetQuestion, RemoveQuestion, CreateQuestion } = require("./itemQuestion");
const { GetPaymentMessage, RemovePaymentMessage, CreatePaymentMessage } = require("./itemPaymentMessage");

const { GetReview, RemoveReview, CreateReview } = require("./itemReview");
const auth = require("../../middlewares/auth");
const { likeItem, unlikeItem, getLikeItem, likeInItem } = require("./like");

//answer
const { createSubmit, updateSubmit, getSubmit, getSubmit2, getMySubmitList } = require("./answer");

const { getPurchasedHeader } = require("./list-header");

router.get("/list/:page/:sorting?/:cate1?/:cate2?/:cate3?/:keyword?", itemList, getItemList);
router.get("/getItemCount/:sorting?/:cate1?/:cate2?/:cate3?/:keyword?", getItemCount);

// router.get("/item-count/:id", getCount);
router.get("/list-count/:cate1?/:cate2?", getTotalCount);
router.get("/detail/:id", tokenDecoded, itemDetail); 
router.get("/:item/purchased-header/:payment", tokenDecoded, getPurchasedHeader);
router.get("/toplist/:page", getTopList, getItemList);
router.get("/detail/:card/content", tokenDecoded, itemCard);
router.get("/detail/:id/step", tokenDecoded, itemStep);
router.get("/detail/:id/step2", tokenDecoded, itemStep2);
router.get("/detail/:id/step3", tokenDecoded, itemStep3);

router.post("/create", auth, insertThumbnail, createItem);
router.post("/update/:id", auth, updateItem);
router.post("/detail/:card/update", auth, updateItemContent);
router.delete("/delete/:id", auth, deleteItem);

// question
router.get("/detail/:id/question/:page", tokenDecoded, GetQuestion);
router.post("/detail/:id/create-question", auth, CreateQuestion);
router.delete("/detail/:id/delete-question/:target_id", auth, RemoveQuestion);

// payment
router.get("/detail/:id/paymentMessage/:page", tokenDecoded, GetPaymentMessage);
router.post("/detail/:id/paymentMessage",auth,CreatePaymentMessage);
router.delete("/detail/:id/deletePaymentMessage/:target_id", auth, RemovePaymentMessage);
// router.post("/detail/:id/paymentMessage", auth, CreatePaymentMessage);

// review
router.get("/detail/:id/review/:page", tokenDecoded, GetReview);
router.post("/detail/:id/create-review", auth, CreateReview);
router.delete("/detail/:id/delete-review/:target_id", auth, RemoveReview);
;

// like
router.post("/likeItem/:id", auth, likeItem);
router.post("/unlikeItem/:id", auth, unlikeItem);
router.get("/getLikeItem/:id", auth, getLikeItem);
router.get("/itemDetail/:id/like/:page", likeInItem, getItemList);
router.get("/itemDetail/:id/have/:page", HaveInItem, getItemList);

// header
router.post("/detail/updateHeader/:id", auth, updateListHeader);
router.post("/detail/createHeader/:id", auth, (req, res, next) => {
	const { createListHeader } = require("./itemList");
	const obj = { name: "", type: "item", content_id: req.params.id, editor_type: "project"};

	createListHeader(obj)
		.then(res.status(200).json({ success: true, }))
		.catch(res.status(500).json({ success: false, }));
});
// list
router.post("/detail/:id/createList", auth, createItemList);
router.delete("/detail/:id/deleteList/:list_id", auth, deleteItemList);
router.post("/detail/:id/updateList/:list_id", auth, updateItemList);
// card
router.post("/detail/:id/:list_id/createCard", auth, createItemCard);
router.post("/detail/updateCardAllData/:card_id", auth, insertThumbnail, updateCardInfo, updateCardSource);
router.delete("/detail/:id/deleteCard/:card_id", auth, deleteItemCard);
// ${host}/item/detail/${id}/${list_id}/createCard

// uploaditemlist
router.get("/getUploadItemList/:id/:page", getUploadItemList, getItemList);
// my project item list
router.get("/getMyProjectItemList/:id/:page", getMyProjectItemList, getItemList);

//review
router.get("/get-review/:id/:page", getItemReivew);
router.get("/get-review-count/:id", getItemReviewTotalCount);



////////////////////////////////
// GRADE-SERVER REDIRECTING
////////////////////////////////
const graderURL = "13.125.133.65:8080"; // "market.opensrcdesign.com:8080";
router.get("/problem/category/:category_id",
async (req, res, next) => {
  const category_id = req.params.category_id;
  const url = `http://${graderURL}/api/v1/problem/?categories=${category_id}`;
  try {
    const result = await axios({ url: url, method: 'GET', });
    res.status(200).json(result.data);
  } catch(e) {
    console.error(e);
  }
});

router.get("/problem/language",
async (req, res, next) => {
  //const page = req.params.page;
  const url = `http://${graderURL}/api/v1/language`;
  try {
    const result= await axios({ url: url, method: 'GET', });
    res.status(200).json(result.data);
  } catch(e) {
    console.error(e);
  }
});

router.get("/problem/category",
async (req, res, next) => {
  const page = req.params.page;
  const url = `http://${graderURL}/api/v1/category`;
  try {
    const result= await axios({
      url: url,
      method: 'get',
    });
  // console.log(result.data);
    res.status(200).json(result.data);
  } catch(e) {
    console.error(e);
  }
});

router.get("/problem/list/:page",
async (req, res, next) => {
  const page = req.params.page;
  const url = `http://${graderURL}/api/v1/problem/?page=${page}`;
  try {
    const result= await axios({
      url: url,
      method: 'get',
    });
    res.status(200).json(result.data);
  } catch(e) {
    const detail = e.response && e.response.data.detail;
    console.error('[ERROR]: get problem list', detail);
    res.status(200).json({error: detail});
  }
});

router.get("/problem/detail/:id",
async (req, res, next) => {
  const uid = req.params.id;
  const url = `http://${graderURL}/api/v1/problem/${uid}`;
  try{
    const result= await axios({
      url: url,
      method: 'get',
    });
    res.status(200).json(result.data);
  }catch(e){
    console.error(e);
  }
});

// SUBMIT
router.post("/problem/submit", auth, createSubmit);
router.put("/problem/update-submit/:id", updateSubmit);
router.get("/problem/result-request/:id", getSubmit);
router.get("/problem/result-request2/:id", getSubmit2);
router.get("/problem/mySubmitList/:user_id/:content_id", getMySubmitList);

module.exports = router;

