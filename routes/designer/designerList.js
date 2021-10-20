const connection = require("../../configs/connection");

exports.designerList = (req, res, next) => {
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  let sort;
  const keyword = req.params.keyword;
  
  // let sql;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }

  // if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
  //   sql = "SELECT U.uid, U.nick_name,D.about_me, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1";
  // } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
  //   sql = "SELECT U.uid, U.nick_name, D.about_me, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1 AND D.category_level2 = " + category2;
  // } else if (category1) { // 카테고리 레벨 1이 설정된 경우
  //   sql = "SELECT U.uid, U.nick_name, D.about_me, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1 AND D.category_level1 = " + category1;
  // }
  // if (keyword && keyword !== "null" && keyword !== "undefined") {
  //   sql = sql + ` AND U.nick_name LIKE "%${keyword}%"`;
  // }
  // if (sort === "update") {
  //   sql = sql + " ORDER BY U.update_time DESC LIMIT ";
  // } else if (sort === "create") {
  //   sql = sql + " ORDER BY U.create_time DESC LIMIT ";
  // } else if (sort === "like") {
  //   sql = sql + " ORDER BY C.total_like DESC LIMIT ";
  // }
  // //  if(page == 0){
  // sql = sql + page * 30 + ", 30;";
  // //  } else {
  // //	sql = sql + (page*10 +30)+ ", 10;";
  // //  }
  // //  console.log(sql);
  // req.sql = sql;

  let sql2 = `
  SELECT 
  U.uid, U.nick_name,
  D.about_me, D.category_level1, D.category_level2, 
  U.thumbnail, U.create_time, U.update_time, U.create_time,
  C.total_design, C.total_group, C.total_like, C.total_view,
  L1.name as level1_name, L2.name as level2_name
  FROM opendesign.user_detail D 
  JOIN opendesign.user U ON U.uid = D.user_id 
  LEFT JOIN opendesign.user_counter C ON C.user_id = U.uid
  LEFT JOIN opendesign.category_level1 L1 ON L1.uid=D.category_level1
  LEFT JOIN opendesign.category_level2 L2 ON L2.uid=D.category_level2
  `
  // 0. nothing
  // 1. category2
  // 2. category1
  // 3. category2 keyword
  // 4. category1 keyword
  if (category2 || category1 ||
    (keyword && keyword !== "null" && keyword !== "undefined")) {
    sql2 = sql2 + `WHERE `;
  }
  if (category2) {
    sql2 = sql2 + `category_level2 = ${category2}`;
  } else if (category1) {
    sql2 = sql2 + `category_level1 = ${category1}`;
  }

  if (category2 || category1) {
    // sql2 = sql2 + ` AND `;
  }
  if (keyword && keyword !== "null" && keyword !== "undefined") {
    const ary = keyword.trim().split(" ");
    ary.length > 0 && ary.map((word, index) => {
      if (word !== "") {
        if (index !== 0) {
          sql2 = sql2 + ` AND `;
        }
        sql2 = sql2 + `U.nick_name LIKE "%${word}%" `;
      }
      return word;
    });
  }
  sql2 = sql2 + `
  ORDER BY ${ sort === "update" ? "U.update_time" : sort === "create" ? "U.create_time" : "C.total_like"} DESC
  LIMIT ${ page * 30}, 30;`;
  // console.log("DESIGNER LIST SELECT QUERY", sql2);
  req.sql = sql2;
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


exports.designerList_newversion = (req, res, next) => {
  // console.log("?");
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  const category3 = req.params.cate3 && req.params.cate3 !== "null" && req.params.cate2 !== "undefined" ? req.params.cate3 : null;
  let sort;
  const keyword = req.params.keyword;
  
  // let sql;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }
  let sql2 = `
  SELECT 
  U.uid, U.nick_name,
  D.about_me, D.category_level1, D.category_level2, D.category_level3,
  U.thumbnail, U.create_time, U.update_time, U.create_time,
  C.total_design, C.total_group, C.total_like, C.total_view,
  L1.name as level1_name, L2.name as level2_name, L3.name as level3_name
  FROM opendesign.user_detail D 
  JOIN opendesign.user U ON U.uid = D.user_id 
  LEFT JOIN opendesign.user_counter C ON C.user_id = U.uid
  LEFT JOIN opendesign.category_level1 L1 ON L1.uid=D.category_level1
  LEFT JOIN opendesign.category_level2 L2 ON L2.uid=D.category_level2
  LEFT JOIN opendesign.category_level3 L3 ON L3.uid=D.category_level3
  WHERE D.is_designer=1 AND U.d_flag=0
  `
  // 0. nothing
  // 1. category2
  // 2. category1
  // 3. category2 keyword
  // 4. category1 keyword
  if (category3 || category2 || category1 ||
    (keyword && keyword !== "null" && keyword !== "undefined")) {
    sql2 = sql2 + `AND `;
  }
  if(category3){
    sql2 = sql2 + `category_level3 = ${category3}`;
  } else if (category2) {
    sql2 = sql2 + `category_level2 = ${category2}`;
  } else if (category1) {
    sql2 = sql2 + `category_level1 = ${category1}`;
  }

  if (category2 || category1) {
    // sql2 = sql2 + ` AND `;
  }
  if (keyword && keyword !== "null" && keyword !== "undefined") {
    const ary = keyword.trim().split(" ");
    ary.length > 0 && ary.map((word, index) => {
      if (word !== "") {
        if (index !== 0) {
          sql2 = sql2 + ` AND `;
        }
        sql2 = sql2 + `U.nick_name LIKE "%${word}%" `;
      }
      return word;
    });
  }
  sql2 = sql2 + `
  ORDER BY ${ sort === "update" ? "U.update_time" : sort === "create" ? "U.create_time" : "C.total_like"} DESC
  LIMIT ${ page * 30}, 30;`;
  // console.log("DESIGNER LIST SELECT QUERY", sql2);
  req.sql = sql2;
  next();
};

exports.getTotalCount_newversion = (req, res, next) => {
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  const category3 = req.params.cate3 && req.params.cate3 !== "null" && req.params.cate2 !== "undefined" ? req.params.cate3 : null;
  let sql;

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = `SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1`;
  } else if (category3) { // 카테고리 3가 설정된 경우 먼저 빼감
    sql = `SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1 AND category_level3 = ${category3}`;
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = `SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1 AND category_level2 = ${category2}`;
  } else if (category1) { // 카테고리 1이 설정된 경우
    sql = `SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1 AND category_level1 = ${category1}`;
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

