var connection = require("../../configs/connection");

// 디자인 이슈 리스트 가져오기 (GET)
exports.designIssue = (req, res, next) => {
  const designId = req.params.id;

  // issue 목록 데이터 가져오기
  function getIssueList (id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT * FROM design_issue WHERE design_id = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          for (var i = 0, l = row.length; i < l; i++) {
            let IssueData = row[i];
            arr.push(new Promise((resolve, reject) => {
              connection.query("SELECT count(*) FROM issue_comment WHERE issue_id = ?", IssueData.uid, (err, result) => {
                if (!err) {
                  IssueData.commentCount = result[0];
                  resolve(IssueData);
                } else {
                  reject(err);
                }
              });
            }));
          }
          Promise.all(arr).then(result => {
            resolve(result);
          }).catch(console.log("no"));
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getIssueList(designId)
    .then(arr => res.status(200).json(arr))
    .catch(err => res.status(500).json(err));
};

// **********************************************************

// 디자인 이슈 디테일 페이지 가져오기 (GET)
exports.designIssueDetail = (req, res, next) => {
  const issueId = req.params.issue_id;

  // 디자인 디테일 정보 가져오기 (GET)
  function getIssueDetail (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design_issue WHERE uid = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let issueData = row[0];
          resolve(issueData);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 디자인 이슈 디테일 코멘트 가져오기 (GET)
  function getIssueComment (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM issue_comment WHERE issue_id = ?", id, (err, row) => {
        if (!err && row.length > 0) {
          data.comment = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getIssueDetail(issueId)
    .then(getIssueComment)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};
