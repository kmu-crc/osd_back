var connection = require("../../configs/connection");

exports.myAllDesign = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sql = `
  SELECT 
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, 
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  FROM design D
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid 
  WHERE D.user_id = ${id} 
UNION
  SELECT
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time,
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  FROM design_member M
  JOIN design D ON D.uid = M.design_id
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid
  WHERE M.is_join = 1 AND M.user_id = ${id} AND D.user_id != ${id} LIMIT ` + (page * 10) + `, 10`
  req.sql = sql;
  next();
 
}
// 내 기본 정보 가져오기
exports.myPage = (req, res, next) => {
  const id = req.decoded.uid;

  // 마이페이지 내 기본 정보 가져오기 (GET)
  function getMyInfo (id) {
    const p = new Promise((resolve, reject) => {
      update_totals(id)
      connection.query("SELECT U.uid, U.nick_name, U.update_time, U.thumbnail, U.password, D.category_level1, D.category_level2, D.about_me, D.is_designer , D.team, D.location, D.career, D.contact FROM user U JOIN user_detail D ON D.user_id = U.uid WHERE U.uid = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 내 프로필 사진 가져오기 (GET)
  function getThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      if (data.thumbnail === null) {
        data.profileImg = null;
        resolve(data);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            data.profileImg = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.profileImg = row[0];
            resolve(data);
          } else {
            //console.log(err);
            reject(err);
          }
        });
      }
    });
    return p;
  };

  function update_totals (uid) {
    connection.query(`UPDATE opendesign.user_counter SET total_design =(SELECT COUNT(*) FROM opendesign.design WHERE user_id=${uid}) WHERE user_id=${uid};`)
    connection.query(`UPDATE opendesign.user_counter SET total_like   =(SELECT COUNT(*) FROM opendesign.design_like WHERE user_id=${uid}) WHERE user_id=${uid};`)
    connection.query(`UPDATE opendesign.user_counter SET total_group  =(SELECT COUNT(*) FROM opendesign.group WHERE user_id=${uid}) WHERE user_id=${uid};`)
    connection.query(`UPDATE opendesign.user_counter SET total_view   =(SELECT SUM(view_count) FROM opendesign.design_counter WHERE design_id IN (SELECT uid FROM opendesign.design WHERE user_id=${uid})) WHERE user_id=${uid};`)
  }

  // 나의 count 정보 가져오기 (GET)
  function getMyCount (data) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT total_like, total_design, total_group, total_view FROM user_counter WHERE user_id =${data.uid}`, data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.count = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.count = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 카테고리 이름 가져오기
  function getCategory (data) {
    const p = new Promise((resolve, reject) => {
      let cate;
      let sql;
      if (!data.category_level1 && !data.category_level2) {
        data.categoryName = null;
        //console.log("no cate");
        resolve(data);
      } else if (data.category_level2 && data.category_level2 !== "") {
        cate = data.category_level2;
        sql = "SELECT name FROM category_level2 WHERE uid = ?";
      } else {
        cate = data.category_level1;
        sql = "SELECT name FROM category_level1 WHERE uid = ?";
      }
      connection.query(sql, cate, (err, result) => {
        if (!err) {
          data.categoryName = result[0].name;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getMyInfo(id)
    .then(getThumbnail)
    .then(getMyCount)
    .then(getCategory)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

// 내 디자인 리스트 가져오기
exports.myDesign = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = `
  SELECT 
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, 
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
   FROM design D 
   LEFT JOIN design_counter C ON C.design_id = D.uid 
   LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM design DD group by DD.parent_design) F ON F.parent_design = D.uid
   WHERE D.user_id = ${id}`
  if (sort === "date") {
    sql = sql + " ORDER BY D.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 속한 그룹 리스트 가져오기
exports.inGroup = (req, res, next) => {
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
							WHERE design_id IN (SELECT uid FROM opendesign.design WHERE user_id = ${id}))) AS T 
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

 if(page){
   sql = sql + ` LIMIT ${page * 10}, 10`;
 }
 req.sql = sql;
 next();
};


// 내가 그룹장인 그룹 리스트 가져오기
exports.myGroup = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }
  let sql = `SELECT R.uid, U.nick_name, R.title, R.explanation, R.thumbnail, R.create_time, R.child_update_time, R.user_id, C.like, C.design, C.group FROM opendesign.group R LEFT JOIN opendesign.user U ON U.uid = ${id} LEFT JOIN group_counter C ON C.group_id = R.uid WHERE R.user_id =${id}`;

  if (sort === "date") {
    sql = sql + " ORDER BY R.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 좋아요 누른 디자인 가져오기
exports.myLikeDesign = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = `
  SELECT 
  D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.create_time, 
  C.like_count, C.member_count, C.card_count, C.view_count, F.children_count
  FROM design_like L 
  JOIN design D ON D.uid = L.design_id 
  LEFT JOIN (SELECT DD.parent_design, COUNT(*) AS children_count FROM design DD group by DD.parent_design) F ON F.parent_design = D.uid
  LEFT JOIN design_counter C ON C.design_id = D.uid WHERE L.user_id = ${id}`;
  if (sort === "date") {
    sql = sql + " ORDER BY D.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like_count DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 좋아요 누른 그룹 가져오기
exports.myLikeGroup = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT R.uid, R.title, R.thumbnail, R.create_time, R.user_id, C.like, C.design, C.group FROM group_like L LEFT JOIN opendesign.group R ON R.uid = L.group_id LEFT JOIN group_counter C ON C.group_id = R.uid WHERE L.user_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY R.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 좋아요 누른 디자이너 가져오기
exports.myLikeDesigner = (req, res, next) => {
  const id = req.decoded.uid;
  const page = req.params.page;
  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "date";
  }

  let sql = "SELECT U.uid, U.nick_name, D.category_level1, D.category_level2, U.thumbnail, U.create_time, U.update_time, C.total_design, C.total_group, C.total_like, C.total_view FROM user_like L JOIN user_detail D ON D.user_id = L.designer_id JOIN user U ON U.uid = D.user_id LEFT JOIN user_counter C ON C.user_id = U.uid WHERE L.user_id = " + id;
  if (sort === "date") {
    sql = sql + " ORDER BY U.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.total_like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

// 내가 받은 초대 리스트 가져오기
exports.getMyInvitedList = (req, res, next) => {
  const id = req.decoded.uid;
  const sql = `SELECT D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.is_project
               FROM design D
               RIGHT JOIN design_member M ON M.invited = 1 AND is_join = 0 AND M.user_id = ${id}
               WHERE M.design_id = D.uid`;

  req.sql = sql;
  next();
};

// 내가 보낸 가입 신청 리스트 가져오기
exports.getMyInvitingList = (req, res, next) => {
  const id = req.decoded.uid;
  const sql = `SELECT D.uid, D.user_id, D.title, D.thumbnail, D.parent_design, D.category_level1, D.category_level2, D.is_project, M.is_join
               FROM design D
               RIGHT JOIN design_member M ON M.invited = 0 AND M.user_id = ${id}
               WHERE M.design_id = D.uid`;

  req.sql = sql;
  next();
};
