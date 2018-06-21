var connection = require("../../configs/connection");

// 내 기본 정보 가져오기
exports.myPage = (req, res, next) => {
  const id = req.decoded.uid;

  // 마이페이지 내 기본 정보 가져오기 (GET)
  function getMyInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT U.uid, U.nick_name, U.thumbnail, D.category_level1, D.category_level2, D.about_me, D.is_designer FROM user U JOIN user_detail D ON D.user_id = U.uid WHERE U.uid = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
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
        data.profileImg = null;
        resolve(data);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            data.profileImg = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.profileImg = row[0];
            resolve(data);
          } else {
            console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 나의 count 정보 가져오기 (GET)
  function getMyCount (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT total_like, total_design, total_group, total_view FROM user_counter WHERE user_id = ?", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.count = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.count = row[0];
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
      if (!data.category_level1 && !data.category_level2) {
        data.categoryName = null;
        console.log("no cate");
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
          data.categoryName = result[0].name;
          console.log(data);
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
    .then(getMyCount)
    .then(getCategory)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

// 내 디자인 리스트 가져오기
exports.myDesign = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, C.like_count, C.member_count, C.card_count, C.view_count FROM design_member M JOIN design D ON D.uid = M.design_id LEFT JOIN design_counter C ON C.design_id = D.uid WHERE M.user_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY D.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 그룹장인 그룹 리스트 가져오기
exports.myGroup = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT R.uid, R.title, R.thumbnail, R.create_time, R.user_id, C.like, C.design, C.group FROM opendesign.group R LEFT JOIN group_counter C ON C.group_id = R.uid WHERE R.user_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY R.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 좋아요 누른 디자인 가져오기
exports.myLikeDesign = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, C.like_count, C.member_count, C.card_count, C.view_count FROM design_like L JOIN design D ON D.uid = L.design_id LEFT JOIN design_counter C ON C.design_id = D.uid WHERE L.user_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY D.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 좋아요 누른 그룹 가져오기
exports.myLikeGroup = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT R.uid, R.title, R.thumbnail, R.create_time, R.user_id, C.like, C.design, C.group FROM group_like L LEFT JOIN opendesign.group R ON R.uid = L.group_id LEFT JOIN group_counter C ON C.group_id = R.uid WHERE L.user_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY R.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 좋아요 누른 디자이너 가져오기
exports.myLikeDesigner = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT U.uid, U.nick_name, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_like L JOIN user_detail D ON D.user_id = L.designer_id JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE L.user_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY U.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.total_like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};
