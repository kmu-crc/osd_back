
exports.getTopList = (req, res, next) => {
  const page = req.params.page;
  const sql = `SELECT
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, D.is_project
  ,C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  ,CD.order
    FROM opendesign.design D
    LEFT JOIN opendesign.design_counter C ON C.design_id = D.uid
    LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM design DD group by DD.parent_design) F ON F.parent_design = D.uid
    LEFT JOIN opendesign.collection_design CD ON CD.design_id = D.uid 
    WHERE D.uid IN(SELECT CD.design_id FROM opendesign.collection_design)
    ORDER BY CD.order ASC, C.like_count DESC LIMIT ${(page * 10)}, 10`;
  req.sql = sql;
  next();
};
