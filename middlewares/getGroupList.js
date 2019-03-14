const connection = require("../configs/connection");

const getGroupList = (req, res, next) => {
  const sql = req.sql;
  //console.log(sql);
  // 그룹 리스트 가져오기 (GET)
  function getGroupList (sql) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
  //          console.log( row);
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
          console.log("!");
          reject(err);
        }
      });
    });
    console.log(p);
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

  getGroupList(sql)
    .then(result => {
      console.log(result, "!!!");
      res.status(200).json(result)})
    .catch(err => {
      console.log(err);
      res.status(500).json(err)
    });
};

module.exports = getGroupList;
