
exports.getTopList = (req, res, next) => {
  const page = req.params.page;
  const sql = `SELECT 
  U.uid, U.nick_name, U.thumbnail, U.create_time, U.update_time
  ,D.category_level1, D.category_level2
  ,C.total_design, C.total_group, C.total_like, C.total_view
  ,CD.order
    FROM user_detail D
    LEFT JOIN opendesign.user U ON U.uid = D.user_id 
    LEFT JOIN opendesign.user_counter C ON C.user_id = U.uid 
    LEFT JOIN opendesign.collection_designer CD ON U.uid = CD.user_id
    WHERE U.uid IN(
      SELECT CD.user_id FROM opendesign.collection_designer CD)
    ORDER BY CD.order ASC, C.total_like DESC LIMIT ${(page*5)}, 5`;

  req.sql = sql;
  next();
};
