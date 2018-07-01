
exports.getTopList = (req, res, next) => {
  const sql = `SELECT 
  U.uid, U.nick_name, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, 
  C.total_design, C.total_group, C.total_like, C.total_view 
    FROM user_detail D 
    JOIN user U ON U.uid = D.user_id 
    LEFT JOIN user_counter C ON C.user_id = U.uid 
    WHERE D.is_designer = 1
    ORDER BY C.total_like DESC LIMIT 0, 5`;

  req.sql = sql;
  next();
};
