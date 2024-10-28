const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const stringToNumber = require("../../middlewares/stringToNumber");
const getDesignList = require("../../middlewares/getDesignList");
const getGroupList = require("../../middlewares/getGroupList");

const { groupList, getTotalCount } = require("./groupList");
const { topGroupList,getTopMainGroupList, getTopGroupTotalCount, updateTopGroup, insertTopGroup, deleteTopGroup } = require("./topGroupList");
const { allGroupList, getAllGroupTotalCount } = require("./allGroupList");
const { groupMember, groupDetail, getCount } = require("./groupDetail");
const { designInGroup } = require("./designInGroup");
const { groupInGroup } = require("./groupInGroup");

const { groupSignUp, groupSignUpGroup } = require("./groupSignUp");
const { createGroup } = require("./createGroup");
const { updateGroup, createGroupIssue, deleteGroupIssue } = require("./updateGroup");
const { deleteAllGroup } = require("./deleteGroup");
const { waitingDesign, waitingGroup } = require("./waitingList");
const { getLastestGroupNotice, getTotalCountGroupNotice, getGroupNoticeList, createGroupNotice
  ,updateGroupNotice, deleteGroupNotice
} = require("./groupNotice");
const insertThumbnail = require("../../middlewares/insertThumbnail");
const { myDesignList, myGroupList, myExistDesignList, myExistGroupList } = require("./getMyList");
const { acceptDesign, acceptGroup, deleteDesign, deleteGroup } = require("./manageGroup");
const { getLikeGroup, likeGroup, unlikeGroup } = require("./likeGroup");

const { getSubmitStatus, checkHasProgrammingDesign, getHaveGroupInDesign } = require("./submit");
const { getProblemContentList } = require("./duedate");

const { getCouldJoinVChat2 } = require("./chat");
const { checkInvited, inviteUser, cancelInvitedUser } = require("./inviteVideoChat");
const { 
	createGroupBoard, getGroupBoardList, updateGroupBoard, removeGroupBoard, 
	createGroupBoardComment, getGroupBoardCommentList, updateGroupBoardComment, removeGroupBoardComment, 
} = require("./groupBoard");

// 그룹에 대한 정보들 가져오기
router.get("/groupList/:page/:sorting?/:keyword?", groupList, getGroupList);
router.get("/groupCount", getTotalCount);
router.get("/topGroupList/:page/:sorting?/:keyword?", topGroupList, getGroupList);
router.get("/topGroupCount", getTopGroupTotalCount);
router.get("/allGroupList/", allGroupList, getGroupList);
router.get("/allGroupCount", getAllGroupTotalCount);
router.get("/groupDetail/:id", groupDetail);
router.get("/groupMember/:id", groupMember);
router.get("/groupDetail/:id/design/:page/:sorting?", designInGroup, getDesignList);
router.get("/groupDetail/:id/group/:page/:sorting?", groupInGroup, getGroupList);

router.post("/groupSignUp", auth, groupSignUp);

// 그룹 가입 신청 관련
router.get("/:id/join/myDesignList", auth, myDesignList);
router.get("/:id/join/myGroupList", auth, myGroupList);
router.post("/groupDetail/:id/DesignJoinGroup", auth, groupSignUp);
router.post("/groupDetail/:id/GroupJoinGroup", auth, groupSignUpGroup);
router.get("/groupDetail/:id/waitingDesign/:sorting?", waitingDesign, getDesignList);
router.get("/groupDetail/:id/waitingGroup/:sorting?", waitingGroup, getGroupList);
router.post("/groupDetail/:id/acceptDesign/:designId", acceptDesign);
router.post("/groupDetail/:id/acceptGroup/:groupId", acceptGroup);
router.delete("/groupDetail/:id/deleteDesign/:designId", deleteDesign);
router.delete("/groupDetail/:id/deleteGroup/:groupId", deleteGroup);
router.get("/:id/join/myExistDesignList", auth, myExistDesignList);
router.get("/:id/join/myExistGroupList", auth, myExistGroupList);

// 그룹 생성, 수정, 삭제
router.post("/createGroup", auth, insertThumbnail, stringToNumber, createGroup);
router.post("/:id/updateGroup", auth, insertThumbnail, stringToNumber, updateGroup);
router.post("/:id/updateTopGroup", auth, updateTopGroup);
router.post("/:id/insertTopGroup", auth, insertTopGroup);
router.post("/:id/deleteTopGroup", auth, deleteTopGroup);
router.post("/groupDetail/:id/createIssue", auth, createGroupIssue);
router.delete("/groupDetail/:id/deleteIssue/:issue_id", auth, deleteGroupIssue);
router.delete("/:id/deleteGroup", auth, deleteAllGroup);

// 그룹 좋아요 관련
router.get("/getLike/:id", auth, getLikeGroup);
router.post("/like/:id", auth, likeGroup);
router.post("/unlike/:id", auth, unlikeGroup);

// 그룹 count 조회
router.get("/getCount/:id", getCount);

//  group-notice
router.get("/lastest-notice/:group_id", getLastestGroupNotice);
router.get("/total-count-notice/:group_id", getTotalCountGroupNotice);
router.get("/notice-list/:group_id/:page", getGroupNoticeList);
router.post("/createGroupNotice", auth, createGroupNotice);
router.post("/updateGroupNotice", auth, updateGroupNotice);
router.delete("/deleteGroupNotice/:id", auth, deleteGroupNotice);

// programming design
router.get("/getSubmitStatus/:id", auth, getSubmitStatus);
router.get("/check-has-programming-design/:id", auth, checkHasProgrammingDesign);
router.get("/:id/problemcontents", auth, getProblemContentList);

router.get("/:id/check-could-join-vchat/", auth, getCouldJoinVChat2);

// top 5개 리스트 가져오기 (메인용)
router.get("/topMainGroupList/:page", getTopMainGroupList,getGroupList);

// video
router.get("/:id/video-chat/check-invited", auth, checkInvited);
router.post("/:id/video-chat/invite-user", auth, inviteUser);
router.post("/:id/video-chat/cancel-invited-user", auth, cancelInvitedUser);

// group board
router.post("/:id/board", auth, createGroupBoard);
router.get("/:id/board/:page", getGroupBoardList);
router.patch("/:id/board/:board_id", auth, updateGroupBoard);
router.delete("/:group_id/board/:board_id", auth, removeGroupBoard);

// group board comment
router.post("/:group_id/board/:board_id/comment", auth, createGroupBoardComment);
router.get("/:id/board/:board_id/comment", getGroupBoardCommentList);
router.patch("/:id/board/:board_id/comment/:comment_id", auth, updateGroupBoardComment);
router.delete("/:id/board/:board_id/comment/:comment_id", auth, removeGroupBoardComment);

//new
router.get("/getHaveGroupInDesign/:id" , getHaveGroupInDesign);

module.exports = router;

