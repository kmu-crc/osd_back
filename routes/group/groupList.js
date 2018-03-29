var connection = require("../../configs/connection");
const { getDesignTop3 } = require("../../middlewares/getDesignTop3");

exports.groupList = (req, res, next) => {
  // 그룹 리스트 가져오기 (GET)
  function getGroupList () {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM group", (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            const groupData = row[i];
            resolve(groupData);
          }
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 그룹 좋아요 수, 멤버수, 디자인수, 총 좋아요 수 가져오기 (GET)
  function getGroupCount (data) {
    const p = new Promise((resolve, reject) => {
      const groupId = data.uid;
      connection.query("SELECT * FROM group_counter WHERE uid = ?", groupId, (err, result) => {
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

  getGroupList()
    .then(getGroupCount)
    .then(data => getDesignTop3(data, "groupId"))
    .then(data => res.json(data));
};
