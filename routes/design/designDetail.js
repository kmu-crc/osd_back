var connection = require("../../configs/connection");

// 디자인 디테일 정보 가져오기 (GET)
exports.designDetail = (req, res, next) => {
  const designId = req.params.id;

  // 디자인 기본 정보 가져오기
  function getDesignInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design WHERE uid = ?", id, (err, row) => {
        if (!err) {
          let data = row[0];
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
      connection.query("SELECT nick_name FROM user WHERE uid = ?", userId, (err, result) => {
        if (!err) {
          data.userName = result[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

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
          data.categoryName = result[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 좋아요 수, 조회수, 멤버수, 카드수 가져오기
  function getCount (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM design_counter WHERE design_id = ?", id, (err, row) => {
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

  // 속한 멤버들의 id, 닉네임 리스트 가져오기
  function getMemberList (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT D.user_id, U.nick_name FROM design_member D JOIN user U ON U.uid = D.user_id WHERE design_id = ?", id, (err, row) => {
        if (!err) {
          data.member = row[0];
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
      connection.query("SELECT count(*) FROM design WHERE parents_design = ?", id, (err, result) => {
        if (!err) {
          data.children_count = result[0];
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
    .then(getMemberList)
    .then(getChildrenCount)
    .then(data => res.status(200).json(data));
};
