const connection = require("../../configs/connection");

// 디자인 이슈 리스트 가져오기 (GET)
exports.searchIssue = (req, res, next) => {
  const keyword = req.params.keyword;
  const designId = req.params.id;
  //console.log(keyword);

  function getIssueList (id, keyword) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      let sql;
      if (keyword && keyword !== "null") {
        sql = `SELECT * FROM design_issue WHERE design_id = ${id} AND title LIKE "%${keyword}%"`;
      } else {
        sql = `SELECT * FROM design_issue WHERE design_id = ${id}`;
      }
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          //console.log("work");
          resolve(null);
        } else if (!err && row.length > 0) {
          for (var i = 0, l = row.length; i < l; i++) {
            let IssueData = row[i];
            arr.push(new Promise((resolve, reject) => {
              connection.query("SELECT count(*) FROM issue_comment WHERE issue_id = ?", IssueData.uid, (err, result) => {
                if (!err) {
                  IssueData.commentCount = result[0];
                } else {
                  IssueData.commentCount = null;
                }
              });
              if (IssueData.user_id === null) {
                IssueData.userName = null;
                resolve(IssueData);
              } else {
                connection.query("SELECT nick_name FROM user WHERE uid = ?", IssueData.user_id, (err, result) => {
                  if (!err && result.length === 0) {
                    IssueData.userName = null;
                    resolve(IssueData);
                  } else if (!err && result.length > 0) {
                    IssueData.userName = result[0].nick_name;
                    resolve(IssueData);
                  } else {
                    reject(err);
                  }
                });
              }
            }));
          }
          Promise.all(arr).then(result => {
            resolve(result);
          }).catch(console.log(err));
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  getIssueList(designId, keyword)
    .then(arr => res.status(200).json(arr))
    .catch(err => res.status(500).json(err));
};
