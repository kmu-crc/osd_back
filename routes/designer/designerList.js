var connection = require("../../configs/connection");

exports.designerList = (req, res, next) => {
  // 디자이너 리스트 가져오기 (GET)
  function getDesignerList () {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT U.uid, U.nick_name, U.thumbnail FROM user_detail D JOIN user U ON U.uid = D.user_id WHERE D.is_designer = 1", (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          for (var i = 0, l = row.length; i < l; i++) {
            arr.push(new Promise((resolve, reject) => {
              let designerData = row[i];
              getThumbnail(designerData);
              getProfile(designerData);
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

  function getThumbnail (data) {
    let arr = [];
    connection.query("SELECT D.uid, T.s_img FROM design D JOIN thumbnail T ON T.uid = D.thumbnail WHERE D.user_id = ?", data.uid, (err, row) => {
      if (!err) {
        if (row.length > 3) {
          for (var i = 0; i < 3; i++) {
            arr.push(row[i]);
          }
        } else if (row.length <= 3) {
          arr = row;
        }
        data.designTop3 = arr;
      } else {
        console.log(err);
      }
    });
  };

  function getProfile (data) {
    connection.query("SELECT m_img FROM thumbnail WHERE user_id = ?", data.uid, (err, result) => {
      if (!err) {
        data.imgURL = result[0];
      } else {
        console.log(err);
      }
    });
  }

  getDesignerList()
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
