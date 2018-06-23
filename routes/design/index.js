const express = require("express");
const router = express.Router();

const { designList } = require("./designList");
const { designDetail, getCount, updateViewCount } = require("./designDetail");
const { getLikeDesign, likeDesign, unlikeDesign } = require("./likeDesign");
const { designView } = require("./designView");
const { designStep, designCardDetail } = require("./designStep");
const { designIssue, designIssueDetail } = require("./designIssue");
const { createIssue, updateIssue, updateIssueStatus, deleteIssue } = require("./createIssue");
const auth = require("../../middlewares/auth");
const tokenDecoded = require("../../middlewares/tokenDecoded");
const getDesignList = require("../../middlewares/getDesignList");
const { createDesign } = require("./createDesign");
const uploadDesign = require("../../middlewares/uploadDesign");
const stringToNumber = require("../../middlewares/stringToNumber");
const { createBoard, getBoardList, updateBoard, deleteBoard } = require("./designBoard");
const { createCard, getCardList, updateCard, updateTitle, updateContent, getCardDetail, updateImages, updateSources } = require("./designCard");

router.get("/designList/:page/:sorting?/:cate1?/:cate2?", designList, getDesignList);
router.get("/designDetail/:id", tokenDecoded, designDetail);
router.get("/designDetail/:id/view", designView);
router.get("/designDetail/:id/step", designStep);
router.get("/designDetail/:id/cardDetail/:card_id", designCardDetail);

router.get("/designDetail/:id/getBoardList", getBoardList);
router.get("/designDetail/:id/getCardList", getCardList);
router.get("/designDetail/getCardDetail/:cardId", getCardDetail);

router.get("/getLike/:id", auth, getLikeDesign);
router.post("/like/:id", auth, likeDesign);
router.post("/unlike/:id", auth, unlikeDesign);

router.get("/getCount/:id", getCount);
router.post("/updateViewCount/:id", updateViewCount);

router.post("/createDesign", auth, uploadDesign, stringToNumber, createDesign);
router.post("/designDetail/:id/createBoard", auth, stringToNumber, createBoard);
router.post("/designDetail/:id/:boardId/createCard", auth, stringToNumber, createCard);
router.post("/designDetail/:id/:boardId/updateCard/:cardId", auth, uploadDesign, stringToNumber, updateCard);
router.post("/designDetail/updateBoard/:board_id", auth, updateBoard);
router.post("/designDetail/updateCardTitle/:cardId", auth, stringToNumber, updateTitle);
router.post("/designDetail/updateCardContent/:cardId", auth, stringToNumber, updateContent);
router.post("/designDetail/updateCardImages/:cardId", auth, uploadDesign, stringToNumber, updateImages);
router.post("/designDetail/updateCardSources/:cardId", auth, uploadDesign, stringToNumber, updateSources);
router.delete("/designDetail/deleteBoard/:board_id", auth, deleteBoard);

router.get("/designDetail/:id/issue", designIssue);
router.get("/designDetail/:id/issueDetail/:issue_id", designIssueDetail);
router.post("/designDetail/:id/createIssue", auth, createIssue);
router.post("/designDetail/:id/updateIssue/:issue_id", auth, updateIssue);
router.post("/designDetail/:id/updateIssueStatus/:issue_id", auth, updateIssueStatus);
router.delete("/designDetail/:id/deleteIssue/:issue_id", auth, deleteIssue);

module.exports = router;
