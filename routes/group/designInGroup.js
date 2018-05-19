
exports.designInGroup = (req, res, next) => {
  const id = req.params.id;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.is_public, C.like_count, C.member_count, C.card_count, C.view_count FROM group_join_design G JOIN design D ON D.uid = G.design_id LEFT JOIN design_counter C ON C.design_id = D.uid WHERE G.parent_group_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY D.create_time DESC";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC";
  }
  req.sql = sql;
  next();
};
