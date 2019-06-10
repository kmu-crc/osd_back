
exports.waitingDesign = (req, res, next) => {
  const id = req.params.id;
  let sql = `SELECT 
            D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, 
            C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
            FROM group_join_design G 
              JOIN design D ON D.uid = G.design_id 
              LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid
              LEFT JOIN design_counter C ON C.design_id = D.uid 
            WHERE G.parent_group_id = ${id} AND G.is_join = 0 `;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }
  if (sort === "update") {
    sql = sql + " ORDER BY D.update_time DESC";
  } else if (sort === "create") {
    sql = sql + " ORDER BY D.create_time DESC";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC";
  }

  req.sql = sql;
  next();
};

exports.waitingGroup = (req, res, next) => {
  const id = req.params.id;
  let sql = `SELECT 
            R.uid, R.title, R.thumbnail, R.create_time, R.child_update_time, R.user_id, C.like, C.design, C.group 
            FROM group_join_group G 
              JOIN opendesign.group R ON R.uid = G.group_id 
              LEFT JOIN group_counter C ON C.group_id = R.uid 
            WHERE G.parent_group_id = ${id} AND G.is_join = 0 `;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }
  if (sort === "update") {
    sql = sql + " ORDER BY R.child_update_time DESC";
  } else if (sort === "create") {
    sql = sql + " ORDER BY R.create_time DESC";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC";
  }
  req.sql = sql;
  next();
};
