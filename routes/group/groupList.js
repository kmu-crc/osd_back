var connection = require("../../configs/connection");

exports.groupList = (req, res, next) => {
  // 그룹 리스트 가져오기 (GET)
  function getGroupList () {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT * FROM opendesign.group", (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            arr.push(new Promise((resolve, reject) => {
              let groupData = row[i];
              connection.query("SELECT D.uid, T.s_img FROM group_join_design G JOIN design D ON D.uid = G.design_id JOIN thumbnail T ON T.uid = D.thumbnail WHERE group_id = ?", groupData.uid, (err, row) => {
                if (!err) {
                  groupData.designTop3 = row;
                } else {
                  reject(err);
                }
              });
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

  getGroupList()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
