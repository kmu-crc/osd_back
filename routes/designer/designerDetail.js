var connection = require("../../configs/connection");

exports.designerDetail = (req, res, next) => {
  const id = req.params.id;

  // 디자이너 정보 가져오기 (GET)
  function getDesignerInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT U.uid, U.nick_name, D.category_level1, D.category_level2, T.s_img FROM user U JOIN user_detail D ON U.uid = D.user_id JOIN thumbnail T ON U.uid = T.user_id WHERE U.uid = ?", id, (err, result) => {
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

  // 디자이너 count 정보 가져오기 (GET)
  function getDesignerCount (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT total_like, total_design, total_view FROM user_couter WHERE user_id = ?", id, (err, result) => {
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
  function getDesignList (data) {
    const id = data.uid;
    const sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time FROM design D WHERE user_id = ?";

    function getCategory (data) {
      let cate;
      let sqlCate;
      if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sqlCate = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sqlCate = "SELECT name FROM category_level1 WHERE uid = ?";
      }
      connection.query(sqlCate, cate, (err, result) => {
        if (!err) {
          data.categoryName = result[0];
        }
      });
    };

    function getList (id) {
      const p = new Promise((resolve, reject) => {
        let arr = [];
        connection.query(sql, id, (err, row) => {
          if (!err) {
            for (var i = 0, l = row.length; i < l; i++) {
              let data = row[i];
              arr.push(new Promise((resolve, reject) => {
                connection.query("SELECT nick_name FROM user WHERE uid = ?", data.user_id, (err, result) => {
                  if (!err) {
                    data.userName = result[0];
                  } else {
                    reject(err);
                  }
                });
                connection.query("SELECT s_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, result) => {
                  if (!err) {
                    data.thumbnailUrl = result[0];
                  } else {
                    reject(err);
                  }
                });
                getCategory(data);
                connection.query("SELECT * FROM design_counter WHERE design_id = ?", data.uid, (err, row) => {
                  if (!err) {
                    data.count = row[0];
                    resolve(data);
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

    getList(id)
      .then(result => {
        data.designList = result;
        return data;
      }).then(result => res.status(200).json(result))
      .catch(err => res.status(500).json(err));
  };

  getDesignerInfo(id)
    .then(getDesignerCount)
    .then(getDesignList)
    .then(result => console.log(result));
};
