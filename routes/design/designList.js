
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

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, D.is_project, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid WHERE D.is_public = 1";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, D.is_project, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid WHERE D.is_public = 1 AND category_level2 = " + category2;
  } else if (category1) { // 카테고리 1이 설정된 경우
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, D.is_project, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid WHERE D.is_public = 1 AND category_level1 = " + category1;
  }

  if (keyword && keyword !== "null" && keyword !== "undefined") {
    sql = sql + ` AND D.title LIKE "%${keyword}%"`;
  }

  if (sort === "update") {
    sql = sql + " ORDER BY D.update_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "create") {
    sql = sql + " ORDER BY D.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};
