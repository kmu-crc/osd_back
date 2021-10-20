// 자신의 디자인과 참여중인 디자인리스트 가져오기
exports.allDesignInDesigner = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page;
  let sort = "update";
  if (req.params.sort !== "null" && req.params.sort !== undefined && req.params.sort !== "undefined") {
    sort = req.params.sort;
  } else {
    sort = "update";
  }
  let sql = `
  SELECT 
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, D.update_time,
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  FROM design D 
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid 
  WHERE D.user_id = ${id} 
UNION
  SELECT
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, D.update_time,
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  FROM design_member M
  JOIN design D ON D.uid = M.design_id
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid
  WHERE M.is_join = 1 AND M.user_id = ${id} AND D.user_id != ${id}
  ORDER BY ${sort === "update" ? "update_time DESC, like_count DESC" : "like_count DESC, update_time DESC"}
  LIMIT ${page * 10}, 10`
  req.sql = sql;
  next();
};

// 디자이너의 디자인 리스트 가져오기
exports.myDesignInDesigner = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page;
  let sort = "update";
  if (req.params.sort !== "null" && req.params.sort !== undefined && req.params.sort !== "undefined") {
    sort = req.params.sort;
  } else {
    sort = "update";
  }
  let sql = `
  SELECT 
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, D.update_time,
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  FROM design D 
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid 
  WHERE D.user_id = ${id} 
  ORDER BY ${sort === "update" ? "D.update_time DESC, C.like_count DESC" : "C.like_count DESC, D.update_time DESC"}
  LIMIT ${page * 10}, 10`;

  req.sql = sql;
  next();
};

// 디자이너의 참여 디자인 리스트 가져오기
exports.designInDesigner = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page;
  let sort = "update";
  if (req.params.sort !== "null" && req.params.sort !== undefined && req.params.sort !== "undefined") {
    sort = req.params.sort;
  } else {
    sort = "update";
  }
  let sql = `
  SELECT
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, D.update_time,
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  FROM design_member M
  JOIN design D ON D.uid = M.design_id
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid
  WHERE M.is_join = 1 AND M.user_id = ${id} AND D.user_id != ${id} 
  ORDER BY ${sort === "update" ? "D.update_time DESC, C.like_count DESC" : "C.like_count DESC, D.update_time DESC"}
  LIMIT ${page * 10}, 10`;
  req.sql = sql;
  next();
};

exports.likeInDesigner = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page;
  let sort = "update";
  if (req.params.sort !== "null" && req.params.sort !== undefined && req.params.sort !== "undefined") {
    sort = req.params.sort;
  } else {
    sort = "update";
  }
  let sql = `
  SELECT 
  D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.update_time,
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  FROM design_like L 
  JOIN design D ON D.uid = L.design_id 
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid 
  WHERE L.user_id = ${id}
  ORDER BY ${sort === "update" ? "D.update_time DESC, C.like_count DESC" : "C.like_count DESC, D.update_time DESC"}
  LIMIT ${page * 10}, 10`;
  req.sql = sql;
  next();
};

exports.TheBestDesignInDesigner = (req, res, next) => {
  const id = req.params.id;
  let sql = `SELECT D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.update_time, COUNT(DL.design_id) AS DesignLikeCount FROM opendesign.design_like DL LEFT JOIN opendesign.design D ON D.uid = DL.design_id WHERE D.user_id = ${id} GROUP BY DL.design_id ORDER BY DesignLikeCount DESC LIMIT 1`;

  req.sql = sql;
  next();
};
