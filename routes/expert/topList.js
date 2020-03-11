
exports.getTopList = (req, res, next) => {
  // const page = req.params.page;
  const sql = `
  SELECT 
	E.user_id, LOWER(E.type) AS 'type', U.uid, U.nick_name, T.m_img, U.create_time, U.update_time, E.category_level1, E.category_level2   
	FROM market.expert E
    LEFT JOIN market.user U ON U.uid = E.user_id
    LEFT JOIN market.thumbnail T ON T.uid = E.thumbnail_id
	WHERE E.uid IN 
		(SELECT expert_id FROM market.top_designer UNION SELECT expert_id FROM market.top_maker);`;

  req.sql = sql;
  next();
};
