var connection = require("../../configs/connection");

exports.groupList = (req, res, next) => {
  // 그룹 리스트 가져오기 (GET)
  function getGroupList () {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT * FROM opendesign.group", (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          for (var i = 0, l = row.length; i < l; i++) {
            arr.push(new Promise((resolve, reject) => {
              let groupData = row[i];
              getThumbnail(groupData);
              getGroupUser(groupData);
              connection.query("SELECT * FROM group_counter WHERE group_id = ?", groupData.uid, (err, result) => {
                if (!err) {
                  groupData.count = result[0];
                  resolve(groupData);
                } else {
                  reject(err);
                }
              });
            }));
          }
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

  function getThumbnail (data) {
    let arr = [];
    connection.query("SELECT D.uid, T.s_img FROM group_join_design G JOIN design D ON D.uid = G.design_id JOIN thumbnail T ON T.uid = D.thumbnail WHERE group_id = ?", data.uid, (err, row) => {
      if (!err) {
        if (row.length > 3) {
          for (var i = 0; i < 3; i++) {
            arr.push(row[i]);
          }
        } else if (row.length <= 3) {
          arr = row;
        }
        data.designTop3 = row;
      } else {
        console.log(err);
      }
    });
  }

  function getGroupUser (data) {
    connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
      if (!err) {
        data.userName = result[0].nick_name;
      } else {
        console.log(err);
      }
    });
  }

  getGroupList()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
