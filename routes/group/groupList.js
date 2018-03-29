var connection = require("../../configs/connection");
// const { getDesignTop3 } = require("../../middlewares/getDesignTop3");

// 그룹 리스트 가져오기 (GET)
exports.groupList = (req, res, next) => {
  function getGroupList () {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT * FROM opendesign.group", (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            let groupData = row[i];
            arr.push(new Promise((resolve, reject) => {
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
          }).catch(console.log("no"));
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 좋아요 수, 멤버수, 디자인수, 총 좋아요 수 가져오기 (GET)
  // function getGroupCount (data) {
  //   const p = new Promise((resolve, reject) => {
  //     const groupId = data.uid;
  //     connection.query("SELECT * FROM group_counter WHERE uid = ?", groupId, (err, result) => {
  //       if (!err) {
  //         data.count = result[0];
  //         console.log("count working");
  //         resolve(data);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   });
  //   return p;
  // };

  getGroupList()
    .then(data => res.json(data));
};
