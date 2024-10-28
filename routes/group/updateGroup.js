var connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");

exports.updateGroup = (req, res, next) => {
  // req.body["update_time"] = new Date();
  // req.body["child_update_time"] = new Date();
  const groupId = req.params.id;

  const updateGroup = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.group SET ? , update_time = NOW(), child_update_time = NOW() WHERE uid = ${groupId}`, data, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          //console.log(err);
          reject(result);
        }
      });
    });
  };

  const groupUpdata = (id) => {
    let info = req.body;
    if (id !== null) {
      info.thumbnail = id;
    }
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.group SET ?, update_time = now() WHERE uid = ${groupId}`, info, (err, rows) => {
        if (!err) {
          //console.log("detail: ", rows);
          resolve(groupId);
        } else {
          reject(err);
        }
      });
    });
  };

  // const findParentGroup = (id) => {
  //   return new Promise((resolve, reject) => {
  //     connection.query("SELECT parent_group_id FROM group_join_group WHERE group_id = ?", id, (err, row) => {
  //       if (!err && row.length === 0) {
  //         resolve(row);
  //       } else if (!err && row.length > 0) {
  //         let arr = [];
  //         row.map(data => {
  //           arr.push(updateParentGroup(data));
  //         });
  //         Promise.all(arr).then(result => {
  //           resolve(result);
  //         });
  //       } else {
  //         //console.log(err);
  //         reject(err);
  //       }
  //     });
  //   });
  // };

  // const updateParentGroup = (row) => {
  //   return new Promise((resolve, reject) => {
  //     connection.query(`UPDATE opendesign.group SET child_update_time = now() WHERE uid = ${row.parent_group_id}`, (err, result) => {
  //       if (!err) {
  //         //console.log("result", result);
  //         resolve(result);
  //       } else {
  //         //console.log(err);
  //         reject(err);
  //       }
  //     });
  //   });
  // };

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

  updateGroup(req.body)
    .then(() => {
      if (req.file == null) {
        return Promise.resolve(null);
      } else {
        return createThumbnails(req.file);
      }
    })
    .then(groupUpdata)
    // .then(findParentGroup)
    .then(success)
    .catch(fail);
};

exports.createGroupIssue = (req, res, next) => {
  req.body["group_id"] = req.params.id;
  req.body["user_id"] = req.decoded.uid;

  const createIssue = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO group_issue SET ?", data, (err, result) => {
        if (!err) {
          //console.log("result", result);
          resolve(result);
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

  createIssue(req.body)
    .then(success)
    .catch(fail);
};

exports.deleteGroupIssue = (req, res, next) => {
  const groupId = req.params.id;
  const issueId = req.params.issue_id;

  const deleteIssue = (groupId, issueId) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM group_issue WHERE group_id = ${groupId} AND uid = ${issueId}`, (err, result) => {
        if (!err) {
          //console.log("result", result);
          resolve(result);
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

  deleteIssue(groupId, issueId)
    .then(success)
    .catch(fail);
};
