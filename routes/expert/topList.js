
exports.getTopList = (req, res, next) => {
  // const page = req.params.page;
  const sql = `
  SELECT 
	E.user_id, LOWER(E.type) AS 'type', U.uid, U.nick_name, U.thumbnail, U.create_time, U.update_time, D.category_level1, D.category_level2   
	FROM opendesign.expert E
		LEFT JOIN opendesign.user U ON U.uid = E.user_id
        LEFT JOIN opendesign.user_detail D ON D.user_id = E.user_id
	WHERE E.uid IN 
		(SELECT expert_id FROM opendesign.top_designer UNION SELECT expert_id FROM opendesign.top_maker);`;

  req.sql = sql;
  next();
};
