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

  // 그룹 썸네일 가져오기 (GET)
  function getThumnbail (data) {
    const p = new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        data.img = null;
        resolve(data);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            data.img = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.img = row[0];
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  };

  getGroupInfo(id)
    .then(getName)
    .then(getGroupComment)
    .then(getThumnbail)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};

exports.getCount = (req, res, next) => {
  const groupId = req.params.id;
  console.log("work");

  // 그룹 count 정보 가져오기 (GET)
  function getGroupCount (id) {
    console.log("work2");
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM group_counter WHERE group_id = ?", id, (err, row) => {
        if (!err) {
          console.log(row[0]);
          res.status(200).json(row[0]);
        } else {
          console.log(err);
          res.status(500).json(err);
        }
      });
    });
    return p;
  };

  getGroupCount(groupId);
};
