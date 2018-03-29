var connection = require("../../configs/connection");

exports.groupDetail = (req, res, next) => {
  const id = req.params.id;

  // 그룹 정보 가져오기 (GET)
  function getGroupInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM group WHERE uid = ?", id, (err, result) => {
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

  // 디자인 리스트 가져오기 (GET)
  function getDesignList () {
    
  }
};
