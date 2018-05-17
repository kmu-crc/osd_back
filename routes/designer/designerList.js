
exports.designerList = (req, res, next) => {
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
    sql = "SELECT U.uid, U.nick_name, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1";
  } else if (level === "1") { // 카테고리 레벨 1이 설정된 경우
    console.log("this2");
    sql = "SELECT U.uid, U.nick_name, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1 AND D.cateogory_level1 = ? " + category;
  } else if (level === "2") { // 카테고리 레벨 2가 설정된 경우
    console.log("this3");
    sql = "SELECT U.uid, U.nick_name, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_detail D JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE D.is_designer = 1 AND D.cateogory_level2 = ? " + category;
  }

  if (sort === "date") {
    sql = sql + " ORDER BY U.create_time DESC";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.total_like DESC";
  }
  req.sql = sql;
  next();
};
