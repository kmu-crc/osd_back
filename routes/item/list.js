const connection = require("../../configs/connection");

exports.itemList = (req, res, next) => {
  const page = req.params.page;
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  const sort = (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") ? req.params.sorting : "update";
  const keyword = req.params.keyword;
  const basic = `
    SELECT 
      I.uid, I.user_id, I.title, I.thumbnail_id, I.create_time, I.update_time, 
      I.category_level1, I.category_level2, I.private
        FROM market.item I`;

  const optCategory =
    (category2) ? `I.category_level2 = ${category2}`
      : (category1) ? `I.category_level1 = ${category1}` : ``;

  const optKeyword =
    (keyword && keyword !== "null" && keyword !== "undefined") ?
      `AND I.title LIKE "%${keyword}%"` : ``;

  const optSort = `ORDER BY ${(sort === "update") ? `I.update_time` : (sort === "create") ? `I.create_time` : `likes`}`;
  const sql = `${basic} WHERE I.visible = 1 AND I.private = 0 ${optCategory === `` && optKeyword === `` ? "" : "AND"} ${optCategory} ${optKeyword} ${optSort} DESC LIMIT ${page * 10}, 10`;
  req.sql = sql;
  next();
};

exports.getTotalCount = (req, res, next) => {
  const category1 = req.params.cate1 && req.params.cate1 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate1 : null;
  const category2 = req.params.cate2 && req.params.cate2 !== "null" && req.params.cate1 !== "undefined" ? req.params.cate2 : null;
  let sql;

  if (!category1 && !category2) { // 카테고리 파라미터가 없는 경우
    sql = "SELECT count(*) FROM design D";
  } else if (category2) { // 카테고리 2가 설정된 경우 먼저 빼감
    sql = "SELECT count(*) FROM design D WHERE category_level2 = " + category2;
  } else if (category1) { // 카테고리 1이 설정된 경우
    sql = "SELECT count(*) FROM design D WHERE category_level1 = " + category1;
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
    .catch(err => res.status(500).json(err));
};

exports.getTopList = (req, res, next) => {
  const page = req.params.page;
  const sql = `
    SELECT
      I.uid, I.user_id, I.title, I.thumbnail_id, I.category_level1, I.category_level2, 
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
      I.uid, I.user_id, I.title, I.thumbnail_id, I.category_level1, I.category_level2, I.create_time, I.update_time,
      T.m_img
        FROM market.item I 
      LEFT JOIN market.thumbnail T ON I.thumbnail_id = T.uid
      WHERE I.user_id = ${id}
      LIMIT ${page * 10}, 10`;

  req.sql = sql;
  next();
}



exports.createItemList = (req, res, next) => {
  const user_id = req.decoded.uid;
  const data = { ...req.body, user_id: user_id };
  //data = { title: _data.title, order: _data.where, type: "item", content_id: this.props.item["item-id"], }
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