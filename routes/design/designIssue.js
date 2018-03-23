var connection = require("../../configs/connection");

// 디자인 이슈 리스트 가져오기 (GET)
exports.designIssue = (req, res, next) => {
  const designId = req.params.id;
  let arr = [];

  // issue 목록 데이터 가져오기
  function getIssueList (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design_issue WHERE design_id = ?", id, (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            let IssueData = row[i];
            resolve(IssueData);
          }
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 각 issue 글들의 코멘트 개수 가져오기
  function getCommentCount (data) {
    const p = new Promise((resolve, reject) => {
      const issueId = data.uid;
      connection.query("SELECT count(*) FROM issue_comment WHERE issue_id = ?", issueId, (err, result) => {
        if (!err) {
          data.commentCount = result;
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  getIssueList(designId)
    .then(getCommentCount)
    .then(data => arr.push(data))
    .then(arr => res.status(200).json(arr));
};

// **********************************************************

// 디자인 이슈 디테일 페이지 가져오기 (GET)
exports.designIssueDetail = (req, res, next) => {
  const issueId = req.params.issue_id;

  // 디자인 디테일 정보 가져오기 (GET)
  function getIssueDetail (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design_issue WHERE uid = ?", id, (err, row) => {
        if (!err) {
          let issueData = row[0];
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 디자인 이슈 디테일 코멘트 가져오기 (GET)
  function getIssueComment (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM issue_comment WHERE issue_id = ?", id, (err, row) => {
        if (!err) {
          data.comment = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  getIssueDetail(issueId)
    .then(getIssueComment)
    .then(data => res.status(200).json(data));
};
