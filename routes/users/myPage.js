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
      // update_totals(id)
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

  function getPaymentsCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'payment_count' FROM market.payment L WHERE L.user_id=${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getSaleItemCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'saleItem_count' FROM market.payment P LEFT JOIN market.item I ON I.uid=P.item_id WHERE I.user_id=${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,saleItem_count:row[0].saleItem_count};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getRequestCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'itemRequest_count' FROM market.payment Q
      LEFT JOIN market.user U ON U.uid = Q.user_id
      WHERE Q.user_id=${id} AND Q.item_id IS NULL;`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,itemRequest_count:row[0].itemRequest_count};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getRegisterItemCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'registerItem_count' FROM market.item I
      WHERE I.user_id=${id};`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,registerItem_count:row[0].registerItem_count};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getLikeItemCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'likeItem_count' FROM market.like L
      WHERE L.type='item' AND L.user_id=${id};`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,likeItem_count:row[0].likeItem_count};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getLikeDesigner(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'likeDesigner_count' FROM market.like L
      WHERE L.type='designer' AND L.user_id=${id};`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,likeDesigner_count:row[0].likeDesigner_count};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getLikeMaker(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'likeMaker_count' FROM market.like L
      WHERE L.type='maker' AND L.user_id=${id};`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,likeMaker_count:row[0].likeMaker_count};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getMyProjectCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `
SELECT COUNT(*) AS 'joinProject_count' FROM market.item I 
LEFT JOIN market.item_detail D ON item_id = I.uid 
WHERE I.uid IN 
	(SELECT DISTINCT item_id FROM market.member M WHERE M.user_id=${id}) AND D.type=1`;
	connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,joinProject_count:row[0].joinProject_count};
          resolve(data);
        } else {
		console.error(err)
          reject(err);
        }
      });
    });
  };
  function getRequestDesignerCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'requestDesigner_count' FROM market.request Q
      WHERE group_id IN
        (SELECT DISTINCT group_id FROM market.request Q 
              WHERE(client_id = ${id} OR expert_id = ${id}) AND Q.type LIKE 'designer' AND Q.status NOT LIKE 'normal');`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,requestDesigner_count:row[0].requestDesigner_count};
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  function getRequestMakerCount(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'requestMaker_count' FROM market.request Q
      WHERE group_id IN
        (SELECT DISTINCT group_id FROM market.request Q 
              WHERE(client_id = ${id} OR expert_id = ${id}) AND Q.type LIKE 'maker' AND Q.status NOT LIKE 'normal');`;
      connection.query(sql, (err, row) => {
        if (!err) {
          data.allCount = {...data.allCount,requestMaker_count:row[0].requestMaker_count};
          resolve(data);
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
    .then(getPaymentsCount)
    .then(getSaleItemCount)
    .then(getRequestCount)
    .then(getLikeItemCount)
    .then(getLikeDesigner)
    .then(getLikeMaker)
  	.then(getMyProjectCount)
    .then(getRequestDesignerCount)
    .then(getRequestMakerCount)
    .then(getRegisterItemCount)
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
