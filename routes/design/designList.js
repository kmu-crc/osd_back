const connection = require("../../configs/connection");

exports.designList = (req, res, next) => {
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

  sql = `
  SELECT D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.parent_design AS test, D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, D.is_project, 
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count, U.nick_name 
  FROM design D 
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM design DD group by DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid JOIN user U ON U.uid = D.user_id`
  if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = sql + ` WHERE category_level2 = ${category2}`
  } else if (category1) { // 카테고리 1이 설정된 경우
    sql = sql + ` WHERE category_level1 = ${category1}`
  }
  
  if (keyword && keyword !== "null" && keyword !== "undefined") {
    sql = sql + ` AND ( D.title LIKE "%${keyword}%" OR U.nick_name LIKE "%${keyword}%" )`;
  }
  
  
  if (sort === "update") {
    sql = sql + " ORDER BY D.update_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "create") {
    sql = sql + " ORDER BY D.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  // console.log("sql", sql)
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
