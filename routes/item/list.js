const connection = require("../../configs/connection");

exports.itemList = (req, res, next) => {
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  const category3 = req.params.cate3 && req.params.cate3 !== "null" && req.params.cate3 !== "undefined" ? req.params.cate3 : null;
  const sort = (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") ? req.params.sorting : "update";
  const keyword = req.params.keyword;
  const basic = `
    SELECT 
      I.uid, I.user_id, I.title, I.thumbnail_id, I.create_time, I.update_time, 
      I.category_level1, I.category_level2, I.category_level3, I.private, D.type, S.status
        FROM market.item I
		LEFT JOIN market.item_status S ON I.uid=S.item_id
        LEFT JOIN market.item_detail D ON I.uid=D.item_id
        LEFT JOIN (SELECT to_id,COUNT(*) AS count FROM market.like L WHERE L.type=\"item\" GROUP BY to_id,L.type)AS totallike ON totallike.to_id=I.uid
        `;
      

  const optCategory = 
		(category3) 
		? `I.category_level3 = ${category3} AND I.category_level2 = ${category2} AND I.category_level1 = ${category1}`
		  : (category2) 
			  ? `I.category_level2 = ${category2} AND I.category_level1 = ${category1}` 
				  : (category1) 
					  ? `I.category_level1 = ${category1}` 
						  : ``;

  const optKeyword =
    (keyword && keyword !== "null" && keyword !== "undefined") ?
      `I.title LIKE "%${keyword}%"` : ``;

  const optSort = `ORDER BY ${(sort === "update") ? `I.update_time DESC` : (sort === "name") ? `I.title ASC` : `count DESC`}`;
  const sql = `${basic} WHERE I.visible = 1 AND I.private = 0 ${optCategory === `` && optKeyword === `` ? "" : "AND"} ${optCategory} ${optKeyword} ${optSort} LIMIT ${page * 8}, 8`;
  // console.log(sql);
  req.sql = sql;
  next();
};

exports.getItemCount = (req, res, next) => {
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  const category3 = req.params.cate3 && req.params.cate3 !== "null" && req.params.cate3 !== "undefined" ? req.params.cate3 : null;
  const sort = (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") ? req.params.sorting : "update";
  const keyword = req.params.keyword;
  const basic = `
    SELECT 
      COUNT(*) AS count
        FROM market.item I
        LEFT JOIN market.item_detail D ON I.uid=D.item_id
        LEFT JOIN (SELECT to_id,COUNT(*) AS count FROM market.like L WHERE L.type=\"item\" GROUP BY to_id,L.type)AS totallike ON totallike.to_id=I.uid
        `;
      

  const optCategory =
		(category3)
    ? `I.category_level3 = ${category3} AND I.category_level2 = ${category2} AND I.category_level1 = ${category1}`
    : (category2) 
		? `I.category_level2 = ${category2} AND I.category_level1 = ${category1}`
    : (category1) 
		? `I.category_level1 = ${category1}` 
		: ``;

  const optKeyword =
    (keyword && keyword !== "null" && keyword !== "undefined") ?
      `I.title LIKE "%${keyword}%"` : ``;

  const sql = `${basic} WHERE I.visible = 1 AND I.private = 0 ${optCategory === `` && optKeyword === `` ? "" : "AND"} ${optCategory} ${optKeyword}`;
  console.log(sql);
  req.sql = sql;

  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, result) => {
        if (!err && result.length) {
          console.log(result[0]);
          resolve(result[0]);
        } else {
          reject(err);
        }
      });
    });
  };

  getCount()
    .then(num => res.status(200).json(num))
    .catch(err => res.status(500).json(err));
};

exports.getTotalCount = (req, res, next) => {
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate2 !== "undefined" ? req.params.cate2 : null;
  const category3 = req.params.cate3 && req.params.cate3 !== "null" && req.params.cate3 !== "undefined" ? req.params.cate3 : null;
  let sql;

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = "SELECT count(*) FROM market.item D";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT count(*) FROM market.item D WHERE category_level2 = " + category2;
  } else if (category1) { // 카테고리 1이 설정된 경우
    sql = "SELECT count(*) FROM market.item D WHERE category_level1 = " + category1;
  }

  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, result) => {
        if (!err && result.length) {
          resolve(result[0]);
        } else {
          reject(err);
        }
      });
    });
  };

  getCount()
    .then(num => res.status(200).json(num))
    .catch(err =>res.status(500).json(err));
};

exports.getTopList = (req, res, next) => {
  const page = req.params.page;
  const sql = `
    SELECT
      I.uid, I.user_id, I.title, I.thumbnail_id, I.category_level1, I.category_level2, I.category_level3, 
      I.create_time, I.update_time
      FROM market.item I
        LEFT JOIN market.top_item TI ON TI.item_id = I.uid 
          WHERE I.visible = 1 AND I.uid IN(SELECT TI.item_id FROM market.top_item)
            ORDER BY TI.order ASC, I.update_time DESC LIMIT ${page * 10}, 10`;

  req.sql = sql;
  next();
}

exports.getUploadItemList = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page;
  const sql = `
    SELECT 
      I.uid, I.user_id, I.title, I.thumbnail_id, I.category_level1, I.category_level2, I.category_level3, I.create_time, I.update_time,
      T.m_img,D.type
        FROM market.item I 
      LEFT JOIN market.thumbnail T ON I.thumbnail_id = T.uid
      LEFT JOIN market.item_detail D ON I.uid=D.item_id
      WHERE I.user_id = ${id}
	  ORDER BY I.create_time DESC
      LIMIT ${page * 6}, 6`;

  req.sql = sql;
  next();
}

exports.getMyProjectItemList = (req, res, next) => {
  const uploadtype="project";
  const id = req.params.id;
  const page = req.params.page;
  const sql = `
    SELECT 
      I.uid, I.user_id, I.title, I.thumbnail_id, I.category_level1, I.category_level2, I.category_level3, I.create_time, I.update_time,
      T.m_img,D.type
        FROM market.item I 
      LEFT JOIN market.thumbnail T ON I.thumbnail_id = T.uid
      LEFT JOIN market.item_detail D ON I.uid=D.item_id
      WHERE I.uid IN (SELECT DISTINCT item_id FROM market.member M WHERE M.user_id=${id})
      AND D.type=1
      LIMIT ${page * 10}, 10`;

  req.sql = sql;
  next();
}

exports.createItemList = (req, res, next) => {
  const user_id = req.decoded.uid;
  const data = { ...req.body, user_id: user_id };
  const createList = (obj) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO market.list SET ?", obj, (err, rows) => {
        if (!err) {
          resolve(rows.insertId);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  }
  const respond = () => { res.status(200).json({ success: true, message: "아이템 리스트를 생성하셨습니다." }) }
  const error = (err) => { res.status(200).json({ success: false, message: err }) }
  createList(data)
    .then(respond)
    .catch(error)
};

exports.deleteItemList = (req, res, next) => {
  const list_id = req.params.list_id;

  const deleteList = id => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM market.list WHERE uid=?", id, (err, rows) => {
        if (!err) {
          resolve(rows.insertId);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  }
  const respond = () => { res.status(200).json({ success: true, message: "아이템 리스트를 삭제하셨습니다." }) }
  const error = (err) => { res.status(200).json({ success: false, message: err }) }
  deleteList(list_id)
    .then(respond)
    .catch(error)
};

exports.updateListHeader = (req, res, next) => {
	const id = req.params.id;
	const data = { ...req.body};
	const updateHeader = () => {
		return new Promise((resolve, reject) => {
			const sql = `UPDATE market.list_header SET ? WHERE uid = ${id}`;
			connection.query(sql, data, (err, _) => {
				if (!err) {
					console.log("updated", sql, data, id);
					resolve(true);
				} else {
					console.error("update list header - mysql error", err);
					reject(err);
				}
			});
		});
	};
	const respond = () => res.status(200).json({ success: true, message:"completed update list header :)"});
	const error = (err) => res.status(500).json({ success: false, message: err });
	updateHeader()
	.then(respond)
	.catch(error);
};

exports.updateItemList = (req, res, next) => {
  const list_id = req.params.list_id;
  const data = { ...req.body };
  const updateList = (obj) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE market.list SET ? WHERE uid=${list_id}`, obj, (err, _) => {
        if (!err) {
          resolve(true);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  }
  const respond = () => { res.status(200).json({ success: true, message: "아이템 리스트를 생성하셨습니다." }) }
  const error = (err) => { res.status(200).json({ success: false, message: err }) }

  updateList(data)
    .then(respond)
    .catch(error)
};
