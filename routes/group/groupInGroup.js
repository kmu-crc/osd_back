var connection = require("../../configs/connection");

exports.groupInGroup = (req, res, next) => {
  const id = req.params.id;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT R.uid, R.title, R.thumbnail, R.create_time, R.user_id, C.like, C.design, C.group FROM group_join_group G JOIN opendesign.group R ON R.uid = G.group_id LEFT JOIN group_counter C ON C.group_id = R.uid WHERE parent_group_id = ?";
  if (sort === "date") {
    sql = sql + "ORDER BY R.create_time DESC";
  } else if (sort === "like") {
    sql = sql + "ORDER BY C.like DESC";
  }

  function getGroupList (id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          row.map(data => {
            arr.push(newData(data));
          });
          Promise.all(arr).then(result => {
            resolve(result);
          });
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  function newData (data) {
    return new Promise((resolve, reject) => {
      getMyThumbnail(data).then(url => {
        data.thumbnailUrl = url;
        return data;
      }).then(
        getUserName
      ).then(name => {
        data.userName = name;
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  };

  // 그룹 본인의 썸네일 가져오기
  function getMyThumbnail (data) {
    return new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        resolve(null);
      } else {
        connection.query("SELECT s_img, m_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0]);
          } else {
            return err;
          }
        });
      }
    });
  };

  // 유저 닉네임 불러오기
  function getUserName (data) {
    return new Promise((resolve, reject) => {
      if (data.user_id === null) {
        resolve(null);
      } else {
        connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
          if (!err) {
            resolve(result[0].nick_name);
          } else {
            reject(err);
          }
        });
      }
    });
  };

  getGroupList(id)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
