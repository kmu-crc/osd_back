var connection = require("../../configs/connection");

exports.myPage = (req, res, next) => {
  const id = req.decoded.uid;
  // 마이페이지 내 기본 정보 가져오기 (GET)
  function getMyInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT U.uid, U.nick_name, U.thumbnail, D.category_level1, D.category_level2, D.about_me, D.is_designer FROM user U LEFT JOIN user_detail D ON D.user_id = U.uid WHERE U.uid = ?", id, (err, row) => {
        if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
    return p;
  };

  // 내 프로필 사진 가져오기 (GET)
  function getThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        resolve(data);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length > 0) {
            data.profileImg = row[0];
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 카테고리 이름 가져오기
  function getCategory (data) {
    const p = new Promise((resolve, reject) => {
      let cate;
      let sql;
      if (!data.category_level1 && !data.category_level2) {
        resolve(data);
      } else if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sql = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sql = "SELECT name FROM category_level1 WHERE uid = ?";
      }
      connection.query(sql, cate, (err, result) => {
        if (!err) {
          data.categoryName = result[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getMyInfo(id)
    .then(getThumbnail)
    .then(getCategory)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};
