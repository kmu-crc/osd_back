var connection = require("../../configs/connection");

exports.designerDetail = (req, res, next) => {
  const id = req.params.id;

  // 디자이너 정보 가져오기 (GET)
  function getDesignerInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT U.uid, U.nick_name, U.thumbnail, U.create_time, U.update_time, D.category_level1, D.category_level2, D.about_me FROM user U LEFT JOIN user_detail D ON U.uid = D.user_id WHERE U.uid = ?", id, (err, row) => {
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

  // 디자이너 프로필 썸네일 가져오기
  function getMyThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      if (!data.thumbnail) {
        data.thumbnailUrl = null;
        resolve(data);
      } else {
        connection.query("SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
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
      }
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

  getDesignerInfo(id)
    .then(getMyThumbnail)
    .then(getCategory)
    .then(result => res.status(200).json(result))
    .catch(err => { console.log(err); res.status(500).json(err); });
};

exports.getCount = (req, res, next) => {
  const designerId = req.params.id;

  // 디자이너 count 정보 가져오기 (GET)
  function getDesignerCount (data) {
    const p = new Promise((resolve, reject) => {
    const sql = `
SELECT A.total_favorite,
        F.joined_design, G.*,
        C.like_group, E.like_design, D.like_designer, 
        B.total_like, B.total_design, B.total_group, B.total_view
FROM opendesign.user_counter B,
		(SELECT (SELECT count(*) FROM opendesign.group_like WHERE user_id=${designerId}) + (SELECT count(*) FROM opendesign.user_like WHERE user_id=${designerId}) + (SELECT count(*) FROM opendesign.design_like WHERE user_id =${designerId}) AS 'total_favorite') A,
        (SELECT count(*) AS 'like_group' FROM opendesign.group_like WHERE user_id=${designerId}) C,
        (SELECT count(*) AS 'like_designer' FROM opendesign.user_like WHERE user_id=${designerId}) D,
        (SELECT count(*) AS 'like_design' FROM opendesign.design_like WHERE user_id=${designerId}) E,
        (SELECT count(*) AS 'joined_design' FROM design_member M JOIN design D ON D.uid = M.design_id LEFT JOIN (SELECT DD.parent_design FROM opendesign.design DD GROUP BY DD.parent_design) F ON F.parent_design = D.uid LEFT JOIN design_counter C ON C.design_id = D.uid WHERE M.is_join = 1 AND M.user_id = ${designerId} AND D.user_id != ${designerId}) F,
		(SELECT ((SELECT COUNT(*) FROM (SELECT G.uid, G.user_id, G.title, G.explanation, G.thumbnail, G.create_time, G.update_time, G.child_update_time, G.d_flag FROM opendesign.group G WHERE uid IN (SELECT DISTINCT parent_group_id FROM opendesign.group_join_design WHERE design_id IN (SELECT uid FROM opendesign.design WHERE user_id = ${designerId}) AND NOT user_id = ${designerId})) AS T LEFT JOIN opendesign.group_counter GC ON T.uid = GC.group_id LEFT JOIN opendesign.user U ON T.user_id = U.uid)+(SELECT COUNT(*)FROM (SELECT G.uid, G.user_id, G.title, G.explanation, G.thumbnail, G.create_time, G.update_time, G.child_update_time, G.d_flag FROM opendesign.group G WHERE uid IN (SELECT DISTINCT parent_group_id FROM opendesign.group_join_group WHERE group_id IN (SELECT uid FROM opendesign.group WHERE user_id = ${designerId}))) AS T LEFT JOIN opendesign.group_counter GC ON T.uid = GC.group_id LEFT JOIN opendesign.user U ON T.user_id = U.uid )) AS 'joined_group' ) G
WHERE B.user_id = ${designerId};

`
//const sql = `SELECT total_like, total_design, total_group, total_view FROM user_counter WHERE user_id = ${designerId}` 
      connection.query(sql, (err, row) => {
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
