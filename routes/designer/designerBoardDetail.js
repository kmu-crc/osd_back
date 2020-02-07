var connection = require("../../configs/connection");


// title, category, create_time, 
// writer, level, 

exports.designerBoardDetail = (req, res, next) => {
  const id = req.params.id;

  // get board detail
  const getBoardDetail = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM opendesign.request WHERE uid=${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row.length ? row[0] : null);
        } else {
          reject(err);
        }
      });
    });
  };
  // 디자이너 이름
  const getName = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT nick_name FROM opendesign.user WHERE uid=${data.writer};`, (err, row) => {
        if (!err && row.length === 0) {
          data.nick_name = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.nick_name = row[0]["nick_name"];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  // COUNTER
  const getCountLike = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT COUNT(*) FROM opendesign.request_like WHERE board_id=${data.uid};`, (err, row) => {
        if (!err && row.length === 0) {
          data.likes = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.likes = row[0]["COUNT(*)"];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  const getCountView = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT views FROM opendesign.request_view WHERE board_id=${data.uid};`, (err, row) => {
        if (!err && row.length === 0) {
          data.view = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.view = row[0]["views"];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  // 디자이너 프로필 썸네일 가져오기
  const getThumbnail = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT s_img, m_img, l_img FROM thumbnail WHERE uid IN(SELECT thumbnail FROM opendesign.user WHERE uid=${data.writer});`, (err, row) => {
        if (!err && row.length === 0) {
          data.thumbnailUrl = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.thumbnailUrl = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  // 카테고리 이름 가져오기
  const getCategory = (data) => {
    return new Promise((resolve, reject) => {
      let cate, sql
      if (!data.category_level1 && !data.category_level2) {
        data.categoryName = null;
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
  };


  getBoardDetail(id)
    .then(getThumbnail)
    .then(getCategory)
    .then(getName)
    .then(getCountView)
    .then(getCountLike)
    .then(result => res.status(200).json(result))
    .catch(err => { console.log(err); res.status(500).json(err); });
};

exports.getBoardCount = (req, res, next) => {
  const designerId = req.params.id;

  // 디자이너 count 정보 가져오기 (GET)
  function getDesignerCount(data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT total_like, total_design, total_group, total_view FROM user_counter WHERE user_id = ?", designerId, (err, row) => {
        if (!err) {
          //console.log(row[0]);
          res.status(200).json(row[0]);
        } else {
          //console.log(err);
          res.status(500).json(err);
        }
      });
    });
    return p;
  };

  getDesignerCount(designerId);
};
