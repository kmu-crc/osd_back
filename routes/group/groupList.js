
exports.groupList = (req, res, next) => {
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }

  let sql = `SELECT 
            G.uid, G.title, G.thumbnail, G.create_time, G.update_time, G.user_id, G.explanation, C.like, C.design, C.group 
            FROM opendesign.group G 
              LEFT JOIN group_counter C ON C.group_id = G.uid`;
  if (sort === "update") {
    sql = sql + " ORDER BY G.child_update_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "create") {
    sql = sql + " ORDER BY G.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};
