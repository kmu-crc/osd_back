const express = require("express");
const router = express.Router();

const { designList } = require("./designList");
const { designDetail } = require("./designDetail");
const { designView } = require("./designView");
const { designStep, designCardDetail } = require("./designStep");
const { designIssue, designIssueDetail } = require("./designIssue");
const auth = require("../../middlewares/auth");
const tokenDecoded = require("../../middlewares/tokenDecoded");
const getDesignList = require("../../middlewares/getDesignList");
const { createDesign } = require("./createDesign");
const uploadDesign = require("../../middlewares/uploadDesign");
const stringToNumber = require("../../middlewares/stringToNumber");
const { createBoard, getBoardList } = require("./designBoard");
const { createCard, getCardList, updateCard, updateTitle, updateContent, getCardDetail, updateImages, updateSources } = require("./designCard");

router.get("/designList/:page/:sorting?/:cate1?/:cate2?", designList, getDesignList);
router.get("/designDetail/:id", tokenDecoded, designDetail);
router.get("/designDetail/:id/view", designView);
router.get("/designDetail/:id/step", designStep);
router.get("/designDetail/:id/cardDetail/:card_id", designCardDetail);
router.get("/designDetail/:id/issue", designIssue);
router.get("/designDetail/:id/issueDetail/:issue_id", designIssueDetail);
router.get("/designDetail/:id/getBoardList", getBoardList);
router.get("/designDetail/:id/getCardList", getCardList);
router.get("/designDetail/getCardDetail/:cardId", getCardDetail);

router.post("/createDesign", auth, uploadDesign, stringToNumber, createDesign);
router.post("/designDetail/:id/createBoard", auth, stringToNumber, createBoard);
router.post("/designDetail/:id/:boardId/createCard", auth, stringToNumber, createCard);
router.post("/designDetail/:id/:boardId/updateCard/:cardId", auth, uploadDesign, stringToNumber, updateCard);
router.post("/designDetail/updateCardTitle/:cardId", auth, stringToNumber, updateTitle);
router.post("/designDetail/updateCardContent/:cardId", auth, stringToNumber, updateContent);
router.post("/designDetail/updateCardImages/:cardId", auth, uploadDesign, stringToNumber, updateImages);
router.post("/designDetail/updateCardSources/:cardId", auth, uploadDesign, stringToNumber, updateSources);

module.exports = router;
