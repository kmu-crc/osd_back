var connection = require("../../configs/connection");

exports.createIssueComment = (req, res, next) => {
  req.body["user_id"] = req.decoded.uid;
  req.body["issue_id"] = req.params.issue_id;
  let commentId = null;

  const createComment = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO issue_comment SET ?", data, (err, row) => {
        if (!err) {
          //console.log(row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  createComment(req.body)
    .then(success)
    .catch(fail);
};

exports.deleteIssueComment = (req, res, next) => {
  const issueId = req.params.issue_id;
  const cmtId = req.params.comment_id;

  const deleteComment = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM issue_comment WHERE issue_id = ${issueId} AND uid = ${cmtId}`, (err, row) => {
        if (!err) {
          //console.log(row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  deleteComment(req.body)
    .then(success)
    .catch(fail);
};
