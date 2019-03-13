var connection = require("../../configs/connection");

// 새 이슈 생성
exports.createIssue = (req, res, next) => {
  const designId = req.params.id;
  req.body["user_id"] = req.decoded.uid;
  req.body["design_id"] = designId;
  req.body["is_complete"] = 0;

  let issueId = null;

  const insertIssueTable = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO design_issue SET ?", data, (err, rows) => {
        if (!err) {
          //console.log("issueDetail---- ", rows);
          issueId = rows.insertId;
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const updateDesign = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design SET update_time = now() WHERE uid = ${designId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true, id: issueId, design_id: designId});
        } else {
          console.log(err);
          res.status(500).json({success: false, id: issueId, design_id: designId});
        }
      });
    });
  };

  insertIssueTable(req.body)
    .then(updateDesign);
};

// 이슈 수정
exports.updateIssue = (req, res, next) => {
  const designId = req.params.id;
  const issueId = req.params.issue_id;
  // req.body["user_id"] = req.decoded.uid;
  // req.body["design_id"] = designId;
  // req.body["is_complete"] = 0;
  //console.log(req.body);

  const updateIssueTable = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_issue SET ? WHERE uid = ${issueId}`, data, (err, rows) => {
        if (!err) {
          //console.log("issueDetail---- ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const updateDesign = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design SET update_time = now() WHERE uid = ${designId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true, id: issueId, design_id: designId});
        } else {
          console.log(err);
          res.status(500).json({success: false, id: issueId, design_id: designId});
        }
      });
    });
  };

  updateIssueTable(req.body)
    .then(updateDesign);
};

// 이슈 status 수정
exports.updateIssueStatus = (req, res, next) => {
  const designId = req.params.id;
  const issueId = req.params.issue_id;

  const updateIssueStatus = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_issue SET is_complete = ? WHERE uid = ${issueId}`, data.status, (err, rows) => {
        if (!err) {
          res.status(200).json({success: true, id: issueId, design_id: designId});
        } else {
          console.log(err);
          res.status(500).json({success: false, id: issueId, design_id: designId});
        }
      });
    });
  };

  updateIssueStatus(req.body);
};

// 이슈 삭제
exports.deleteIssue = (req, res, next) => {
  const designId = req.params.id;
  const issueId = req.params.issue_id;

  const deleteIssueTable = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_issue WHERE uid = ${issueId}`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const deleteIssueComment = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM issue_comment WHERE issue_id = ${issueId}`, (err, row) => {
        if (!err) {
          res.status(200).json({success: true, design_id: designId});
        } else {
          console.log(err);
          res.status(500).json({success: false, design_id: designId});
        }
      });
    });
  };

  deleteIssueTable(issueId)
    .then(deleteIssueComment);
};
