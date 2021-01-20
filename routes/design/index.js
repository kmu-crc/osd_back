const express = require("express");
const axios = require("axios");
const router = express.Router();
// const connection = require("../../configs/connection");

const { designList, designList_newversion, getTotalCount, getTotalCount_newversion } = require("./designList");
const { designDetail, getCount, updateViewCount, changeToProject, getDesignComment, getCountDesignComment, createDetailComment, deleteDetailComment, confirmDesignComment } = require("./designDetail");
const { getLikeDesign, likeDesign, unlikeDesign } = require("./likeDesign");
const { designView } = require("./designView");
const { designStep, designCardDetail } = require("./designStep");
const { designIssue, designIssueDetail } = require("./designIssue");
const { createIssue, updateIssue, updateIssueStatus, deleteIssue } = require("./createIssue");
const { createIssueComment, deleteIssueComment } = require("./designIssueCmt");
const auth = require("../../middlewares/auth");
const insertThumbnail = require("../../middlewares/insertThumbnail");
const tokenDecoded = require("../../middlewares/tokenDecoded");
const getDesignList = require("../../middlewares/getDesignList");
const { createDesign } = require("./createDesign");
const { forkDesign2, forkDesign, getForkDesignList } = require("./forkDesign")

const uploadDesign = require("../../middlewares/uploadDesign");
const stringToNumber = require("../../middlewares/stringToNumber");
const stringToBoolean = require("../../middlewares/stringToBoolean");
const { createBoard, getBoardList, updateBoard, deleteBoard } = require("./designBoard");
const {
    createCard, getCardList, updateTitle, updateContent, getCardDetail,
    updateImages, updateSources, deleteCard, getCardSource, updateCardSource, updateCardAllData,
    updateCardInfo2, updateCardSource2
} = require("./designCard");
const { deleteDesign } = require("./deleteDesign");
const { getCardComment, createCardComment, deleteCardComment } = require("./designCardCmt");
const { getTopList } = require("./topList");
const { updateDesignInfo, updateDesignTime } = require("./updateDesign");
const { joinDesign, acceptMember, getoutMember, getWaitingMember, getWaitingToAcceptMember } = require("../design/joinMember");
const { checkInvited, inviteUser, cancelInvitedUser } = require("./inviteVideoChat");

// PROBLEM
const { createSubmit, updateSubmit, getSubmit, getMySubmitList } = require("./answer");

router.get("/designList/:page/:sorting?/:cate1?/:cate2?/:keyword?", designList, getDesignList);
router.get("/designList_newversion/:page/:sorting?/:cate1?/:cate2?/:cate3?/:keyword?", designList_newversion, getDesignList);

router.get("/designCount/:cate1?/:cate2?", getTotalCount);
router.get("/designCount_newversion/:cate1?/:cate2?/:cate3", getTotalCount_newversion);
router.get("/designDetail/:id", tokenDecoded, designDetail);
router.get("/designDetail/:id/view", tokenDecoded, designView);
router.get("/designDetail/:id/step", designStep);
router.get("/designDetail/:id/cardDetail/:card_id", designCardDetail);

router.get("/designDetail/:id/getBoardList", getBoardList);
router.get("/designDetail/:id/:board_id/getCardList", getCardList);
router.get("/designDetail/getCardDetail/:cardId", getCardDetail);

// 디자인에 가입 신청
router.post("/designDetail/:id/joinDesign/:flag?", auth, joinDesign);
// 디자인에 가입 승인
router.post("/designDetail/:id/acceptDesign/:member_id", auth, acceptMember);
// 디자인 탈퇴
router.delete("/designDetail/:id/getoutDesign/:member_id/:refuse", auth, getoutMember);
// 디자인에 가입 신청중인 멤버 리스트 가져오기
router.get("/designDetail/:id/waitingList", auth, getWaitingMember);
router.get("/designDetail/:id/waitingListAccept", auth, getWaitingToAcceptMember);

// 디자인 좋아요 기능 관련
router.get("/getLike/:id", auth, getLikeDesign);
router.post("/like/:id", auth, likeDesign);
router.post("/unlike/:id", auth, unlikeDesign);

// 조회수
router.get("/getCount/:id", getCount);
router.post("/updateViewCount/:id", updateViewCount);

router.post("/createDesign", auth, stringToNumber, stringToBoolean, createDesign);
router.post("/updateDesignInfo/:id/:uid", auth, insertThumbnail, stringToNumber, updateDesignInfo);
router.post("/updateDesignTime/:id", /*auth,*/
    updateDesignTime);
// (req, res) => {
// connection.query("UPDATE design SET update_time = NOW() WHERE uid = ?", req.params.id);
// });
router.delete("/deleteDesign/:id", auth, deleteDesign);
router.post("/designDetail/:id/createBoard", auth, stringToNumber, createBoard);
router.post("/designDetail/updateBoard/:board_id", auth, updateBoard);
router.delete("/designDetail/:design_id/deleteBoard/:board_id", auth, deleteBoard);

router.post("/designDetail/:id/:boardId/createCard", auth, createCard);
router.post("/designDetail/updateCardTitle/:cardId", auth, updateTitle);
router.post("/designDetail/updateCardContent/:cardId", auth, updateContent);
router.post("/designDetail/updateCardImages/:cardId", auth, uploadDesign, stringToNumber, updateImages);
router.post("/designDetail/updateCardSources/:cardId", auth, uploadDesign, stringToNumber, updateSources);
router.delete("/designDetail/deleteCard/:board_id/:card_id", auth, deleteCard);

// 디자인 issue 관련
router.get("/designDetail/:id/issue", designIssue);
router.get("/designDetail/:id/issueDetail/:issue_id", designIssueDetail);
router.post("/designDetail/:id/createIssue", auth, createIssue);
router.post("/designDetail/:id/updateIssue/:issue_id", auth, updateIssue);
router.post("/designDetail/:id/updateIssueStatus/:issue_id", auth, updateIssueStatus);
router.delete("/designDetail/:id/deleteIssue/:issue_id", auth, deleteIssue);

// comment 관련
router.get("/designDetail/:id/getCardComment/:card_id", getCardComment);
router.post("/designDetail/:id/createCardComment/:card_id", auth, createCardComment);
router.delete("/designDetail/:id/deleteCardComment/:card_id/:comment_id", auth, deleteCardComment);
router.post("/designDetail/:id/issue/:issue_id/createComment", auth, createIssueComment);
router.delete("/designDetail/:id/issue/:issue_id/deleteComment/:comment_id", auth, deleteIssueComment);

// design detail comment
router.get("/designDetail/:id/getDetailComment", getDesignComment);
router.get("/designDetail/:id/getCountComment", getCountDesignComment);
router.post("/designDetail/:id/createDetailComment", auth, createDetailComment);
router.delete("/designDetail/:id/deleteDetailComment/:comment_id", auth, deleteDetailComment);
router.get("/designDetail/:id/confirmDesignComment/", auth, confirmDesignComment);

// 블로그형 디자인 프로젝트형으로 변경
router.post("/changeToProject/:id", auth, changeToProject);

// top 5개 리스트 가져오기 (메인용)
router.get("/TopDesignList/:page", getTopList, getDesignList);

// 새로운 디자인 디테일 로직
router.get("/designDetail/getCardSource/:card_id", getCardSource);
router.post("/designDetail/updateCardSource/:card_id", auth, updateCardSource);
router.post("/designDetail/updateCardSource_temp/:card_id", auth, updateCardSource2);

// 카드의 모든 정보 업데이트
router.post("/designDetail/updateCardAllData/:card_id", auth, updateCardAllData, updateCardSource);
router.post("/designDetail/updateCardAllData_temp/:card_id", auth, updateCardInfo2, updateCardSource2);

// fork Design
// router.get("/forkDesign2/:id/:user_id", forkDesign2);
router.get("/forkDesign/:id/:user_id", auth, forkDesign2);
router.post("/forkDesignList/:id", getForkDesignList);

// video
router.get("/:id/video-chat/check-invited", auth, checkInvited);
router.post("/:id/video-chat/invite-user", auth, inviteUser);
router.post("/:id/video-chat/cancel-invited-user", auth, cancelInvitedUser);

// PROBLEM
router.get("/problem/list",
async (req, res, next) => {
  const url = "http://203.246.113.171:8080/api/v1/problem";
  try {
    const result= await axios({
      url: url,
      method: 'get',
    });
    res.status(200).json(result.data);
  } catch(e) {
    console.error(e);
  }
});

router.get("/problem/detail/:id",
async (req, res, next) => {
  const uid = req.params.id;
  const url = `http://203.246.113.171:8080/api/v1/problem/${uid}`;
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

//ANSWER
router.post("/problem/submit", auth, createSubmit);

router.put("/problem/update-submit/:id", updateSubmit);

router.get("/problem/result-request/:id", getSubmit);

router.get("/problem/mySubmitList/:user_id/:content_id",getMySubmitList);
//(req, res, next)=>{
//  const submit_id = req.params.id;
//  console.log(req.body);
//  // res.send(`제출번호${submit_id}의 값이 변경되었습니다.`);
//  res.status(200).json({"message":`제출번호${submit_id}의 값이 변경되었습니다.`});
//
//});

module.exports = router;
