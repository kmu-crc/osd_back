var connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");
const { updateThumbnailID } = require("../../middlewares/updateThumbnailID");

exports.modifyUserDetail = (req, res, next) => {

  const createHashPw = (pw) => {
    const bcrypt = require("bcrypt");
    return new Promise((resolve, reject) => {
      bcrypt.hash(pw, 10, function (err, hash) {
        if (!err) {
          resolve(hash);
        } else {
          reject(err);
        }
      });
    });
  };
  const updateUserDB = (obj) => {
    return new Promise(async (resolve, reject) => {
      if (obj.password) {
        obj.password = await createHashPw(obj.password);
      }
      const sql = `UPDATE market.user SET ? WHERE uid=${req.decoded.uid}`;
      connection.query(sql, obj, (err, _) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(true)
        }
      });
    })
  }

  createThumbnails(req.file || null)
    .then(data =>
      data && updateThumbnailID({ thumbnail_id: data, user_id: parseInt(req.params.id, 10) }))
    .then(() => updateUserDB(req.body))
    .then(result => res.status(200).json({ success: result, }))
    .catch(err => { console.log(err); res.status(500).json(err) });
}
// 내 기본 정보 가져오기
exports.myPage = (req, res, next) => {
  const id = req.decoded.uid;
  // console.log("getMyInfo", req.decoded.uid);
  // 마이페이지 내 기본 정보 가져오기 (GET)
  function getMyInfo(id) {
    return new Promise((resolve, reject) => {
      update_totals(id)
      connection.query("SELECT U.uid, U.email, U.nick_name, U.phone FROM market.user U WHERE U.uid=?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };

  const getThumbnail = data => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT K.m_img FROM 
        (SELECT * FROM market.thumbnail T WHERE T. user_id=${data.uid} AND T.uid IN (SELECT thumbnail FROM market.user U WHERE U.uid=${id}) 
          UNION SELECT * FROM market.thumbnail T WHERE T.user_id=${data.uid} AND T.uid IN (SELECT thumbnail_id FROM market.expert E WHERE E.user_id=${id})) K
      ORDER BY K.uid DESC
      LIMIT 1`;
      connection.query(sql, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          data.thumbnail = rows[0] ? rows[0].m_img : null;
          // console.log("rows",rows[0])
          resolve(data);
        }
      });
    });
  };

  function update_totals(uid) {
    connection.query(`UPDATE opendesign.user_counter SET total_design =(SELECT COUNT(*) FROM opendesign.design WHERE user_id=${uid}) WHERE user_id=${uid};`)
    connection.query(`UPDATE opendesign.user_counter SET total_like   =(SELECT COUNT(*) FROM opendesign.design_like WHERE user_id=${uid}) WHERE user_id=${uid};`)
    connection.query(`UPDATE opendesign.user_counter SET total_group  =(SELECT COUNT(*) FROM opendesign.group WHERE user_id=${uid}) WHERE user_id=${uid};`)
    connection.query(`UPDATE opendesign.user_counter SET total_view   =(SELECT SUM(view_count) FROM opendesign.design_counter WHERE design_id IN (SELECT uid FROM opendesign.design WHERE user_id=${uid})) WHERE user_id=${uid};`)
  }

  function isDesigner(data) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT (IF(COUNT(*)>0,1,0)) as isDesigner FROM market.expert WHERE user_id=${id} AND type="designer"`, (err, row) => {
        if (!err && row.length === 0) {
          data.isDesigner = false;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.isDesigner = row[0].isDesigner;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }
  function isMaker(data) {
    const p = new Promise((resolve, reject) => {
      connection.query(`SELECT (IF(COUNT(*)>0,1,0)) as isMaker FROM market.expert WHERE user_id=${id} AND type="maker"`, (err, row) => {
        if (!err && row.length === 0) {
          data.isMaker = false;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.isMaker = row[0].isMaker;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }
  // 나의 count 정보 가져오기 (GET)
  function getMyCount(data) {
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
  function getMyLike(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'count' FROM market.like L WHERE (L.type LIKE 'DESIGNER' OR L.type LIKE 'MAKER') AND L.to_id=${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.like = row[0]['count'] || 0;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getMyItemCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'count' FROM market.item L WHERE L.user_id=${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.count = row[0]['count'] || 0;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  // 카테고리 이름 가져오기
  function getCategory(data) {
    // console.log("getCategory",data);
    return new Promise((resolve, reject) => {
      let cate;
      let sqlCate;
      console.log("category_level", data.category_level1, data.category_level2);
      if (!data.category_level1 && !data.category_level2) {
        resolve(null);
      } else if (data.category_level2 && data.category_level2 !== "") {
        sqlCate = `SELECT name FROM market.category_level2 where parents_id=${data.category_level1} LIMIT ${data.category_level2 - 1},1`
      } else {
        sqlCate = `SELECT name FROM market.category_level1 WHERE uid = ${data.category_level1}`;
      }
      connection.query(sqlCate, (err, result) => {
        if (!err) {
          console.log("result[0]=================", result[0]);
          resolve(result[0].name);
        } else {
          reject(err);
        }
      });
    });
  };

  getMyInfo(id)
    .then(getThumbnail)
    .then(getMyLike)
    .then(getMyItemCount)
    .then(isDesigner)
    .then(isMaker)
    // .then(getCategory)
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

  let sql = "SELECT R.uid, R.title, R.thumbnail, R.create_time, R.child_update_time, R.user_id, C.like, C.design, C.group FROM opendesign.group R LEFT JOIN group_counter C ON C.group_id = R.uid WHERE R.user_id = " + id;
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
