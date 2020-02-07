const connection = require("../../configs/connection");

exports.itemList = (req, res, next) => {
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  const sort = (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") ? req.params.sorting : "update";
  const keyword = req.params.keyword;

  const basic = `
    SELECT 
    I.uid, I.user_id, I.title, I.thumbnail, I.create_time, I.update_time, 
      I.category_level1, I.category_level2, 0 AS 'likes'
    FROM opendesign.item I`;
  const optCategory =
    (category2) ? `I.category_level2 = ${category2}`
      : (category1) ? `I.category_level1 = ${category1}` : ``;
  const optKeyword =
    (keyword && keyword !== "null" && keyword !== "undefined") ?
      `AND I.title LIKE "%${keyword}%"` : ``;
  const optSort = `ORDER BY ${(sort === "update") ? `I.update_time` : (sort === "create") ? `I.create_time` : `likes`}`;

  const sql = `${basic} ${optCategory === `` && optKeyword === `` ? "" : "WHERE"} ${optCategory} ${optKeyword} ${optSort} DESC LIMIT ${page * 10}, 10`;
  req.sql = sql;
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

exports.getTopList = (req, res, next) => {
  const page = req.params.page;
  const sql = `
  SELECT
    I.uid, I.user_id, I.title, I.thumbnail, I.category_level1, I.category_level2, 
    I.create_time, I.update_time, I.is_project
  FROM opendesign.item I
    LEFT JOIN opendesign.top_item TI ON TI.item_id = I.uid 
      WHERE I.uid IN(SELECT TI.item_id FROM opendesign.top_item)
        ORDER BY TI.order ASC, I.update_time DESC LIMIT ${page * 10}, 10`;
  // I.is_public, 
  // ,C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  // ,CD.order
  // LEFT JOIN opendesign.design_counter C ON C.design_id = D.uid
  // LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM design DD group by DD.parent_design) F ON F.parent_design = D.uid
  req.sql = sql;
  next();
}