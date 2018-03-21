var connection = require("../../configs/connection");

exports.designDetail = (req, res, next) => {
  const designId = req.params.id;

  // 디자인 기본 정보 가져오기
  function getDesignInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design WHERE uid = ?", id, (err, row) => {
        if (!err) {
          let data = row;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 등록자 닉네임 가져오기
  function getName (data) {
    const p = new Promise((resolve, reject) => {
      const userId = data.user_id;
      connection.query("SELECT nickname FROM user WHERE uid = ?", userId, (err, result) => {
        if (!err) {
          data.userName = result;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 카테고리 이름 가져오기
  function getCategory (data) {
    const p = new Promise((resolve, reject) => {
      let cate;
      let sql;
      if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sql = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sql = "SELECT name FROM category_level1 WHERE uid = ?";
      }
      connection.query(sql, cate, (err, result) => {
        if (!err) {
          data.categoryName = result;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 좋아요 수, 조회수, 멤버수, 카드수 가져오기
  function getCount (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM design_counter WEHRE design_id = ?", id, (err, row) => {
        if (!err) {
          data.count = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 파생된 디자인 수 가져오기
  function getChildrenCount (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT count(*) FROM design WEHRE parents_design = ?", id, (err, result) => {
        if (!err) {
          data.children_count = result;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getDesignInfo(designId)
    .then(getName)
    .then(getCategory)
    .then(getCount)
    .then(getChildrenCount)
    .then(data => res.json(data));
};
