
exports.getTopList = (req, res, next) => {
  const page = req.params.page;
  const sql = `SELECT
  D.uid, D.user_id, D.title, D.thumbnail, D.category_level1, D.category_level2, D.create_time, D.update_time, D.is_public, D.is_project,
  C.like_count, C.member_count, C.card_count, C.view_count
    FROM design D
    LEFT JOIN design_counter C ON C.design_id = D.uid
    WHERE D.is_public = 1
    ORDER BY C.like_count DESC LIMIT ${(page * 10)}, 10`;

  req.sql = sql;
  next();
};
