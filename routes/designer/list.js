const connection = require("../../configs/connection");

exports.designerList = (req, res, next) => {
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate2 !== "undefined" ? req.params.cate2 : null;
  const category3 = req.params.cate3 && req.params.cate3 !== "null" && req.params.cate3 !== "undefined" ? req.params.cate3 : null;
  const sort = (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") ? req.params.sorting : "update";
  const keyword = req.params.keyword;
  // console.log("==========",page,category1,category2,category3,sort,keyword);
  const basic = `
SELECT 
    E.uid, E.user_id, E.category_level1, E.category_level2, E.category_level3, E.score,
    U.nick_name, U.create_time, U.update_time, 
    T.m_img 
FROM market.expert E

LEFT JOIN market.user U ON U.uid = E.user_id 
LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id 
LEFT JOIN (SELECT to_id,COUNT(*) AS count FROM market.like L 
    		WHERE L.type=\"designer\" GROUP BY to_id,L.type)AS totallike ON totallike.to_id=E.user_id 
`
  const optCategory =
    (category3)
    ? `AND E.category_level3 = ${category3} AND E.category_level2 = ${category2} AND E.category_level1 = ${category1}`
    : (category2)
    ? `AND E.category_level2 = ${category2} AND E.category_level1 = ${category1}`
    : (category1)
    ? `AND E.category_level1 = ${category1}`
    : ``;
  const optKeyword = (keyword && keyword !== "null" && keyword !== "undefined") ? `AND U.nick_name LIKE "%${keyword}%"` : ``;
  const optSort = `ORDER BY ${(sort === "update") ? "E.update_time DESC" : (sort === "name") ? "U.nick_name ASC" : "count DESC"}` 
  const sql = `${basic} WHERE E.type = "designer" ${optKeyword} ${optCategory} ${optSort} LIMIT ${page * 10}, 10;`
// console.log(sql);

  req.sql = sql;
  next();
};
exports.getDesignerCount = (req, res, next) => {
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
    sql = "SELECT COUNT(*) AS count FROM market.expert E LEFT JOIN market.user U ON U.uid = E.user_id LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id LEFT JOIN (SELECT to_id,COUNT(*) AS count FROM market.like L WHERE L.type=\"designer\" GROUP BY to_id,L.type)AS totallike ON totallike.to_id=E.user_id WHERE E.type = \"designer\"";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT COUNT(*) AS count FROM market.expert E LEFT JOIN market.user U ON U.uid = E.user_id LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id LEFT JOIN (SELECT to_id,COUNT(*) AS count FROM market.like L WHERE L.type=\"designer\" GROUP BY to_id,L.type)AS totallike ON totallike.to_id=E.user_id WHERE E.type = \"designer\" AND E.category_level1=" + category1 + " AND E.category_level2=" + category2;
  } else if (category1) { // 카테고리 레벨 1이 설정된 경우
    sql = "SELECT COUNT(*) AS count FROM market.expert E LEFT JOIN market.user U ON U.uid = E.user_id LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id LEFT JOIN (SELECT to_id,COUNT(*) AS count FROM market.like L WHERE L.type=\"designer\" GROUP BY to_id,L.type)AS totallike ON totallike.to_id=E.user_id WHERE E.type = \"designer\" AND E.category_level1=" + category1;
  }

  if (keyword && keyword !== "null" && keyword !== "undefined") {
    sql = sql + ` AND U.nick_name LIKE "%${keyword}%"`;
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
exports.getTotalCount = (req, res, next) => {
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  let sql;

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = "SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT count(*) FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE D.is_designer = 1 AND category_level1 = " + category1 + "AND category_level2=" + category2;
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
