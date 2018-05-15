var connection = require("../../configs/connection");

exports.groupDetail = (req, res, next) => {
  const id = req.params.id;

  // 그룹 정보 가져오기 (GET)
  function getGroupInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM opendesign.group WHERE uid = ?", id, (err, result) => {
        if (!err) {
          let data = result[0];
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
      const userId = data.user_id;
      connection.query("SELECT nick_name FROM user WHERE uid = ?", userId, (err, result) => {
        if (!err) {
          data.userName = result[0].nick_name;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 count 정보 가져오기 (GET)
  function getGroupCount (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM group_counter WHERE uid = ?", id, (err, result) => {
        if (!err) {
          data.count = result[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 comment 가져오기 (GET)
  function getGroupComment (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT uid, user_id, comment FROM group_comment WHERE group_id = ?", id, (err, result) => {
        if (!err) {
          data.comment = result[0];
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
