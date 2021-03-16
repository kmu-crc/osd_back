const express = require("express");
const router = express.Router();
const tokenDecoded = require("../../middlewares/tokenDecoded");
const getItemList = require("../../middlewares/getItemList");
const insertThumbnail = require("../../middlewares/insertThumbnail");
const { itemList, getTotalCount, getItemCount, getTopList, getUploadItemList, getMyProjectItemList, updateItemList, deleteItemList, createItemList } = require("./list");
const { itemDetail, itemCard, itemStep, HaveInItem, updateCardInfo, updateCardSource, createItemCard } = require("./detail");
const { createItem, updateItem, deleteItem } = require("./create");
const { updateItemContent, deleteItemCard } = require("./itemCard");
const { GetQuestion, RemoveQuestion, CreateQuestion } = require("./itemQuestion");
const { GetPaymentMessage, RemovePaymentMessage, CreatePaymentMessage } = require("./itemPaymentMessage");

const { GetReview, RemoveReview, CreateReview } = require("./itemReview");
const auth = require("../../middlewares/auth");
const { likeItem, unlikeItem, getLikeItem, likeInItem } = require("./like");

router.get("/list/:page/:sorting?/:cate1?/:cate2?/:keyword?", itemList, getItemList);
router.get("/getItemCount/:sorting?/:cate1?/:cate2?/:keyword?", getItemCount);

router.get("/list-count/:cate1?/:cate2?", getTotalCount);
router.get("/detail/:id", tokenDecoded, itemDetail);
// router.get("/item-count/:id", getCount);
router.get("/toplist/:page", getTopList, getItemList);
router.get("/detail/:card/content", tokenDecoded, itemCard);
router.get("/detail/:id/step", tokenDecoded, itemStep);

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

module.exports = router;

// const { getLikeDesign, likeDesign, unlikeDesign } = require("./likeDesign");
// const { designView } = require("./designView");
// const { designStep, designCardDetail } = require("./designStep");
// const { designIssue, designIssueDetail } = require("./designIssue");
// const { createIssue, updateIssue, updateIssueStatus, deleteIssue } = require("./createIssue");
// const { createIssueComment, deleteIssueComment } = require("./designIssueCmt");
// const auth = require("../../middlewares/auth");
// const insertThumbnail = require("../../middlewares/insertThumbnail");
// const { createDesign } = require("./createDesign");
// const { forkDesign, getForkDesignList } = require("./forkDesign")
// const uploadDesign = require("../../middlewares/uploadDesign");
// const stringToNumber = require("../../middlewares/stringToNumber");
// const stringToBoolean = require("../../middlewares/stringToBoolean");
// const { createBoard, getBoardList, updateBoard, deleteBoard } = require("./designBoard");
// const { createCard, getCardList, updateTitle, updateContent, getCardDetail, updateImages, updateSources, deleteCard, getCardSource, updateCardSource, updateCardAllData } = require("./designCard");
// const { deleteDesign } = require("./deleteDesign");
// const { getCardComment, createCardComment, deleteCardComment } = require("./designCardCmt");
// const { getTopList } = require("./topList");
// const { updateDesignInfo, updateDesignTime } = require("./updateDesign");
// const { joinDesign, acceptMember, getoutMember, getWaitingMember } = require("../design/joinMember");
// router.get("/designDetail/:id/view", tokenDecoded, designView);
// router.get("/designDetail/:id/step", designStep);
// router.get("/designDetail/:id/cardDetail/:card_id", designCardDetail);
// router.get("/designDetail/:id/getBoardList", getBoardList);
// router.get("/designDetail/:id/:board_id/getCardList", getCardList, );
// router.get("/designDetail/getCardDetail/:cardId", getCardDetail);
// // 디자인에 가입 신청
// router.post("/designDetail/:id/joinDesign/:flag?", auth, joinDesign);
// // 디자인에 가입 승인
// router.post("/designDetail/:id/acceptDesign/:member_id", auth, acceptMember);
// // 디자인 탈퇴
// router.delete("/designDetail/:id/getoutDesign/:member_id/:refuse", auth, getoutMember);
// // 디자인에 가입 신청중인 멤버 리스트 가져오기
// router.get("/designDetail/:id/waitingList", auth, getWaitingMember);
// // 디자인 좋아요 기능 관련
// router.get("/getLike/:id", auth, getLikeDesign);
// router.post("/like/:id", auth, likeDesign);
// router.post("/unlike/:id", auth, unlikeDesign);
// // 조회수
// router.post("/updateViewCount/:id", updateViewCount);
// router.post("/createDesign", auth, stringToNumber, stringToBoolean, createDesign);
// router.post("/updateDesignInfo/:id", auth, insertThumbnail, stringToNumber, updateDesignInfo);
// //router.post("/updateDesignTime/:id",auth, updateDesignTime);
// router.post("/updateDesignTime/:id", (req, res) => {
//     connection.query("UPDATE design SET update_time = now() WHERE uid = ?",req.params.id);
// });
// router.delete("/deleteDesign/:id", auth, deleteDesign);
// router.post("/designDetail/:id/createBoard", auth, stringToNumber, createBoard);
// router.post("/designDetail/updateBoard/:board_id", auth, updateBoard);
// router.delete("/designDetail/:design_id/deleteBoard/:board_id", auth, deleteBoard);
// router.post("/designDetail/:id/:boardId/createCard", auth, createCard);
// router.post("/designDetail/updateCardTitle/:cardId", auth, updateTitle);
// router.post("/designDetail/updateCardContent/:cardId", auth, updateContent);
// router.post("/designDetail/updateCardImages/:cardId", auth, uploadDesign, stringToNumber, updateImages);
// router.post("/designDetail/updateCardSources/:cardId", auth, uploadDesign, stringToNumber, updateSources);
// router.delete("/designDetail/deleteCard/:board_id/:card_id", auth, deleteCard);
// // comment 관련
// router.get("/designDetail/:id/getCardComment/:card_id", getCardComment);
// router.post("/designDetail/:id/createCardComment/:card_id", auth, createCardComment);
// router.delete("/designDetail/:id/deleteCardComment/:card_id/:comment_id", auth, deleteCardComment);
// router.post("/designDetail/:id/issue/:issue_id/createComment", auth, createIssueComment);
// router.delete("/designDetail/:id/issue/:issue_id/deleteComment/:comment_id", auth, deleteIssueComment);
// // design detail comment
// router.get("/designDetail/:id/getDetailComment", getDesignComment);
// router.post("/designDetail/:id/createDetailComment", auth, createDetailComment);
// router.delete("/designDetail/:id/deleteDetailComment/:comment_id", auth, deleteDetailComment);
// // 블로그형 디자인 프로젝트형으로 변경
// router.post("/changeToProject/:id", auth, changeToProject);
// // top 5개 리스트 가져오기 (메인용)
// router.get("/TopList/:page", getTopList, getDesignList);
// // 새로운 디자인 디테일 로직
// router.get("/designDetail/getCardSource/:card_id", getCardSource);
// router.post("/designDetail/updateCardSource/:card_id", auth, updateCardSource);
// // 카드의 모든 정보 업데이트
// router.post("/designDetail//:card_id", auth, updateCardAllData, updateCardSource);
// // fork Design
// router.get("/forkDesign/:id/:user_id", auth, forkDesign)
// router.post("/forkDesignList/:id", getForkDesignList)
