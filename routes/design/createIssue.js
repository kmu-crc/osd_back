var connection = require("../../configs/connection");

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
          console.log("issueDetail---- ", rows);
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
