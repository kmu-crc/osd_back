var connection = require("../../configs/connection");

exports.groupList = (req, res, next) => {
  // 그룹 리스트 가져오기 (GET)
  function getGroupList () {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT G.uid, G.title, G.thumbnail, G.create_time, G.update_time, G.user_id, G.explanation, C.like, C.design, C.group FROM opendesign.group G LEFT JOIN group_counter C ON C.group_id = G.uid", (err, row) => {
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

  // 그룹이 가진 컨텐츠 썸네일 불러오기 -> 지금은 적용 안함
  // function getThumbnail (data) {
  //   let arr = [];
  //   connection.query("SELECT D.uid, T.s_img FROM group_join_design G JOIN design D ON D.uid = G.design_id JOIN thumbnail T ON T.uid = D.thumbnail WHERE parent_group_id = ?", data.uid, (err, row) => {
  //     if (!err) {
  //       if (row.length > 3) {
  //         for (var i = 0; i < 3; i++) {
  //           arr.push(row[i]);
  //         }
  //       } else if (row.length <= 3) {
  //         arr = row;
  //       }
  //       data.designTop3 = row;
  //     } else {
  //       console.log(err);
  //     }
  //   });
  // }

  getGroupList()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
