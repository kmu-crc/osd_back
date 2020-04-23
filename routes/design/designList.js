const connection = require("../../configs/connection");

exports.designList = (req, res, next) => {
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  const keyword = req.params.keyword;

  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }

  // let sql;
  // sql = `
  // SELECT D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.parent_design AS test, D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, D.is_project, 
  // C.like_count, C.member_count, C.card_count, C.view_count, F.children_count, U.nick_name 
  // FROM design D 
  // LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM design DD group by DD.parent_design) F ON F.parent_design = D.uid
  // LEFT JOIN design_counter C ON C.design_id = D.uid JOIN user U ON U.uid = D.user_id`
  // if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
  //   sql = sql + ` WHERE category_level2 = ${category2}`
  // } else if (category1) { // 카테고리 1이 설정된 경우
  //   sql = sql + ` WHERE category_level1 = ${category1}`
  // }
  // if (keyword && keyword !== "null" && keyword !== "undefined") {
  //   sql = sql + ` AND ( D.title LIKE "%${keyword}%" OR U.nick_name LIKE "%${keyword}%" )`;
  // }
  // if (sort === "update") {
  //   sql = sql + " ORDER BY D.update_time DESC LIMIT " + (page * 10) + ", 10";
  // } else if (sort === "create") {
  //   sql = sql + " ORDER BY D.create_time DESC LIMIT " + (page * 10) + ", 10";
  // } else if (sort === "like") {
  //   sql = sql + " ORDER BY C.like_count DESC LIMIT " + (page * 10) + ", 10";
  // }
  // req.sql = sql;

  let sql2 = `
    SELECT 
      D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.parent_design AS test, 
      D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, D.is_project, 
      C.like_count, C.member_count, C.card_count, C.view_count, 
      F.children_count, 
      U.nick_name 
    FROM design D 
    LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM design DD group by DD.parent_design) F ON F.parent_design = D.uid
    LEFT JOIN design_counter C ON C.design_id = D.uid JOIN user U ON U.uid = D.user_id
    `
  // 0. nothing
  // 1. category2
  // 2. category1
  // 3. category2 keyword
  // 4. category1 keyword
  if (category2 || category1 ||
    (keyword && keyword !== "null" && keyword !== "undefined")) {
    sql2 = sql2 + ` WHERE `;
  }
  if (category2) {
    sql2 = sql2 + `category_level2 = ${category2}`
  } else if (category1) {
    sql2 = sql2 + `category_level1 = ${category1}`
  }

  if (keyword && keyword !== "null" && keyword !== "undefined") {
    const ary = keyword.trim().split(" ");
    if (category2 || category1) {
      sql2 = sql2 + ` AND `;
    }
    ary.length > 0 && ary.map((word, index) => {
      if (word !== "") {
        if (index !== 0) {
          sql2 = sql2 + ` AND `;
        }
        sql2 = sql2 + `U.nick_name LIKE "%${word}%"`;
      }
      return word;
    });
    if (ary.length > 0) {
      sql2 = sql2 + `OR `;
    }
    ary.length > 0 && ary.map((word, index) => {
      if (word !== "") {
        if (index !== 0) {
          sql2 = sql2 + ` AND `;
        }
        sql2 = sql2 + `D.title LIKE "%${word}%"`;
      }
      return word;
    });

  }
  sql2 = sql2 + `
  ORDER BY ${ sort === "update" ? "D.update_time" : sort === "create" ? "D.create_time" : "C.like_count"} DESC
  LIMIT ${ page * 10}, 10;`;

  // console.log("DESIGN LIST SELECT QUERY", sql2);
  req.sql = sql2;
  next();
};

exports.getTotalCount = (req, res, next) => {
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  let sql;

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = "SELECT count(*) FROM design D";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT count(*) FROM design D WHERE category_level2 = " + category2;
  } else if (category1) { // 카테고리 1이 설정된 경우
    sql = "SELECT count(*) FROM design D WHERE category_level1 = " + category1;
  }

  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, result) => {
        if (!err && result.length) {
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


