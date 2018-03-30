var connection = require("../../configs/connection");

exports.designerList = (req, res, next) => {
  // 디자이너 리스트 가져오기 (GET)
  function getDesignerList () {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT U.uid, U.nick_name, U.thumbnail FROM user U JOIN user_detail D ON D.is_designer = true", (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            arr.push(new Promise((resolve, reject) => {
              let designerData = row[i];
              connection.query("SELECT D.uid, T.s_img FROM design D JOIN thumbnail T ON T.uid = D.thumbnail WHERE D.user_id = ?", designerData.uid, (err, row) => {
                if (!err) {
                  designerData.designTop3 = row;
                } else {
                  reject(err);
                }
              });
              connection.query("SELECT s_img FROM thumbnail WHERE user_id = ?", designerData.uid, (err, result) => {
                if (!err) {
                  designerData.imgURL = result[0];
                } else {
                  reject(err);
                }
              });
              connection.query("SELECT total_like, total_design, total_view FROM user_couter WHERE user_id = ?", designerData.uid, (err, result) => {
                if (!err) {
                  designerData.count = result[0];
                  resolve(designerData);
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

  getDesignerList()
    .then(result => res.json(result));
};
