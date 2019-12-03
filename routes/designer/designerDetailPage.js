// 디자이너가 만든 그룹목록
exports.myGroup = (req, res, next) => {
	const id = req.params.id;
	const page = req.params.page;
	let sql = `
SELECT
	U.nick_name,
	T.*,
	GC.uid AS 'group_counter_uid', GC.group_id, GC.like, GC.design, GC.group,
	TN.uid AS 'thumbnail_uid', TN.user_id, TN.s_img, TN.m_img, TN.l_img
		FROM (SELECT
			G.uid, G.user_id, G.title, G.explanation, G.thumbnail,
			G.create_time, G.update_time, G.child_update_time, G.d_flag
				FROM opendesign.group G 
					WHERE user_id = ${id}) AS T
	LEFT JOIN opendesign.group_counter GC ON T.uid = GC.group_id
	LEFT JOIN opendesign.thumbnail TN ON TN.uid = T.thumbnail
	LEFT JOIN opendesign.user U ON T.user_id = U.uid
`;

	if (page) {
		sql = sql + ` LIMIT ${page * 10}, 10`;
	}

	req.sql = sql;
	next();
};
// 디자이너가 속한 그룹목록
exports.relatedGroup = (req, res, next) => {
	const id = req.params.id;
	const page = req.params.page;
	let sql = `
	SELECT 
		U.nick_name, 
		T.*,
		GC.uid AS 'group_counter_uid', GC.group_id, GC.like, GC.design, GC.group,
		TN.uid AS 'thumbnail_uid', TN.user_id, TN.s_img, TN.m_img, TN.l_img 
			FROM (SELECT 
				G.uid, G.user_id, G.title, G.explanation, G.thumbnail, 
				G.create_time, G.update_time, G.child_update_time, G.d_flag 
					FROM opendesign.group G 
						WHERE uid IN (SELECT DISTINCT parent_group_id 
							FROM opendesign.group_join_design 
								WHERE design_id IN (SELECT uid FROM opendesign.design WHERE user_id = ${id})) AND NOT user_id = ${id}) AS T 
		LEFT JOIN opendesign.group_counter GC ON T.uid = GC.group_id 
		LEFT JOIN opendesign.thumbnail TN ON TN.uid = T.thumbnail 
		LEFT JOIN opendesign.user U ON T.user_id = U.uid 
	UNION 
	SELECT 
		U.nick_name, 
		T.*,
		GC.uid AS 'group_counter_uid', GC.group_id, GC.like, GC.design, GC.group,
		TN.uid AS 'thumbnail_uid', TN.user_id, TN.s_img, TN.m_img, TN.l_img 
			FROM (SELECT 
				G.uid, G.user_id, G.title, G.explanation, G.thumbnail, 
				G.create_time, G.update_time, G.child_update_time, G.d_flag 
					FROM opendesign.group G 
						WHERE uid IN (SELECT DISTINCT parent_group_id 
							FROM opendesign.group_join_group 
								WHERE group_id IN (SELECT uid FROM opendesign.group WHERE user_id = ${id}))) AS T
		LEFT JOIN opendesign.group_counter GC ON T.uid = GC.group_id 
		LEFT JOIN opendesign.thumbnail TN ON TN.uid = T.thumbnail 
		LEFT JOIN opendesign.user U ON T.user_id = U.uid
	`;

	if (page) {
		sql = sql + ` LIMIT ${page * 10}, 10`;
	}

	req.sql = sql;
	next();
};

// 디자이너가 관심 있는 디자이너 목록
exports.designersLikeDesigner = (req, res, next) => {
	const id = req.params.id;
	const page = req.params.page;
	let sql = `SELECT T.uid AS user_id, T.uid, email, nick_name, thumbnail, create_time, update_time, total_design, total_like, total_group, total_view, category_level1, category_level2, about_me, is_designer, team, career, location, contact FROM (SELECT * FROM opendesign.user WHERE uid IN (SELECT designer_id FROM opendesign.user_like where user_id=${id})) AS T 
LEFT JOIN opendesign.user_counter UC ON UC.user_id = T.uid 
LEFT JOIN opendesign.user_detail UD ON UD.user_id = T.uid`
	if (page !== "null") {
		sql = sql + ` LIMIT ${page * 10}, 10`;
	}
	else {
		sql = sql + `;`;
	}
	req.sql = sql;
	next();
};

// 디자이너가 관심 있는 그룹 목록
exports.likeGroup = (req, res, next) => {
	const id = req.params.id;
	const page = req.params.page;
	let sql = `SELECT * FROM (select * FROM opendesign.group where uid in (select group_id from opendesign.group_like where user_id = ${id})) AS T LEFT JOIN opendesign.group_counter GC ON T.uid = GC.group_id LEFT JOIN opendesign.thumbnail TN ON TN.uid = T.thumbnail`
	if (page !== "null") {
		sql = sql + ` LIMIT ${page * 10}, 10`;
	}
	else {
		sql = sql + `;`;
	}
	req.sql = sql;
	console.log(sql);
	next();
};
