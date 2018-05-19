
exports.designList = (req, res, next) => {
  const level = req.query.level;
  const category = (level) ? req.query.category : "";
  let sql;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  if (level === " " || level === undefined) { // 카테고리 파라미터가 없는 경우
    console.log("this1");
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.is_public, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid";
  } else if (level === "1") { // 카테고리 레벨 1이 설정된 경우
    console.log("this2");
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.is_public, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid WHERE category_level1 = " + category;
  } else if (level === "2") { // 카테고리 레벨 2가 설정된 경우
    console.log("this3");
    sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.is_public, C.like_count, C.member_count, C.card_count, C.view_count FROM design D LEFT JOIN design_counter C ON C.design_id = D.uid WHERE category_level2 = " + category;
  }

  if (sort === "date") {
    sql = sql + " ORDER BY D.create_time DESC";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC";
  }
  req.sql = sql;
  next();
};
