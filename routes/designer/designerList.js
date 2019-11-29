const connection = require("../../configs/connection");

exports.designerList = (req, res, next) => {
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  let sql;
  let sort;
  const keyword = req.params.keyword;

  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = "SELECT U.uid, U.nick_name,D.about_me, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT U.uid, U.nick_name, D.about_me, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1 AND D.category_level2 = " + category2;
  } else if (category1) { // 카테고리 레벨 1이 설정된 경우
    sql = "SELECT U.uid, U.nick_name, D.about_me, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1 AND D.category_level1 = " + category1;
  }

  if (keyword && keyword !== "null" && keyword !== "undefined") {
    sql = sql + ` AND U.nick_name LIKE "%${keyword}%"`;
  }

  if (sort === "update") {
    sql = sql + " ORDER BY U.update_time DESC LIMIT ";
  } else if (sort === "create") {
    sql = sql + " ORDER BY U.create_time DESC LIMIT ";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.total_like DESC LIMIT ";
  }

//  if(page == 0){
  	sql = sql + page*30 + ", 30;";
//  } else {
//	sql = sql + (page*10 +30)+ ", 10;";
//  }
//  console.log(sql);
  req.sql = sql;
  next();
};

exports.getTotalCount = (req, res, next) => {
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  let sql;

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = "SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1 AND category_level2 = " + category2;
  } else if (category1) { // 카테고리 1이 설정된 경우
    sql = "SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1 AND category_level1 = " + category1;
  }

  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, result) => {
        if (!err && result.length) {
          //console.log(result);
          resolve(result[0]);
        } else {
          reject(err);
        }
      });
    });
  };

  getCount()
    .then(num => res.status(200).json(num))
    .catch(err => res.status(500).json(err));
};
