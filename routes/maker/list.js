const connection = require("../../configs/connection");

exports.makerList = (req, res, next) => {
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
    sql = "SELECT E.uid,E.user_id, U.nick_name, U.create_time, U.update_time, T.m_img, E.category_level1,E.category_level2, E.score FROM market.expert E LEFT JOIN market.user U ON U.uid = E.user_id LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id WHERE E.type = \"maker\"";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT E.uid,E.user_id, U.nick_name, U.create_time, U.update_time, T.m_img, E.category_level1,E.category_level2, E.score FROM market.expert E LEFT JOIN market.user U ON U.uid = E.user_id LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id WHERE E.type = \"maker\" AND E.category_level1=" + category1 + " AND E.category_level2="+category2;
  } else if (category1) { // 카테고리 레벨 1이 설정된 경우
    sql = "SELECT E.uid,E.user_id, U.nick_name, U.create_time, U.update_time, T.m_img, E.category_level1,E.category_level2, E.score FROM market.expert E LEFT JOIN market.user U ON U.uid = E.user_id LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id WHERE E.type = \"maker\" AND E.category_level1=" + category1;
  }

  if (keyword && keyword !== "null" && keyword !== "undefined") {
    sql = sql + ` AND U.nick_name LIKE "%${keyword}%"`;
  }

  if (sort === "update") {
    sql = sql + " ORDER BY U.update_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "create") {
    sql = sql + " ORDER BY U.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.total_like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
  // const page = req.params.page;
  // const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  // const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  // const sort = (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") ? req.params.sorting : "update";
  // const keyword = req.params.keyword;

  // const basic = `
  // SELECT 
	// U.uid, U.nick_name, U.thumbnail, U.create_time, U.update_time, 
  //   D.category_level1, D.category_level2, 
  //   E.uid AS expert_id, 0 AS 'likes'
  // FROM opendesign.user U 
  //   LEFT JOIN opendesign.expert E ON E.user_id = U.uid AND E.type like "MAKER"
  //   LEFT JOIN opendesign.user_detail D ON D.user_id = U.uid
  //     WHERE U.uid IN (SELECT user_id FROM opendesign.expert E)
  // `;
  // const optCategory =
  //   (category2) ? `AND D.category_level2 = ${category2}`
  //     : (category1) ? `AND D.category_level1 = ${category1}` : ``;
  // const optKeyword =
  //   (keyword && keyword !== "null" && keyword !== "undefined") ?
  //     `AND U.nick_name LIKE "%${keyword}%"` : ``;
  // const optSort = `ORDER BY ${(sort === "update") ? `U.update_time` : (sort === "create") ? `U.create_time` : `likes`}`;

  // const sql = `${basic} ${optCategory} ${optKeyword} ${optSort} DESC LIMIT ${page * 10}, 10`;
  // req.sql = sql;
  // next();
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
