var connection = require("../../configs/connection");

exports.groupDetail = (req, res, next) => {
  const id = req.params.id;

  // 그룹 정보 가져오기 (GET)
  function getGroupInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM opendesign.group WHERE uid = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹장 닉네임 가져오기 (GET)
  function getName (data) {
    const p = new Promise((resolve, reject) => {
      if (data.user_id === null) {
        data.userName = null;
        resolve(data);
      } else {
        connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
          if (!err) {
            data.userName = result[0].nick_name;
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 그룹 count 정보 가져오기 (GET)
  function getGroupCount (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM group_counter WHERE uid = ?", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.count = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.count = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 issue 가져오기 (GET)
  function getGroupComment (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT uid, user_id, title, create_time, update_time FROM group_issue WHERE group_id = ?", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.issue = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.issue = row;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getGroupInfo(id)
    .then(getName)
    .then(getGroupCount)
    .then(getGroupComment)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
