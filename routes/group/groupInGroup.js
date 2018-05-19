
exports.groupInGroup = (req, res, next) => {
  const id = req.params.id;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT R.uid, R.title, R.thumbnail, R.create_time, R.user_id, C.like, C.design, C.group FROM group_join_group G JOIN opendesign.group R ON R.uid = G.group_id LEFT JOIN group_counter C ON C.group_id = R.uid WHERE G.parent_group_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY R.create_time DESC";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like DESC";
  }
  req.sql = sql;
  next();
};