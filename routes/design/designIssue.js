var connection = require("../../configs/connection");

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
    .then(arr => res.json(arr));
};
