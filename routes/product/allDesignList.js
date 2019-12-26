const connection = require("../../configs/connection");

exports.allDesignList = (req, res, next) => {
  let sql = `
  SELECT T.uid, T.title, T.thumbnail, T.create_time, T.category_level1, T.category_level2, T.parent_design, T.user_id, T.explanation, T.like_count, T.member_count, T.view_count, T.comment_count, T.nick_name, T.order FROM (
    SELECT D.uid, D.title, D.thumbnail, D.create_time, D.category_level1, D.category_level2, D.parent_design, D.user_id, D.explanation, C.like_count, C.member_count, C.view_count, C.comment_count, U.nick_name, CD.order
       FROM opendesign.design D
         LEFT JOIN opendesign.design_counter C ON C.design_id = D.uid
         LEFT JOIN opendesign.user U ON U.uid = D.user_id
         LEFT JOIN opendesign.collection_design CD ON CD.design_id = D.uid
       WHERE D.uid IN (SELECT CD.design_id FROM opendesign.collection_design CD)
 UNION
 SELECT D.uid, D.title, D.thumbnail, D.create_time, D.category_level1, D.category_level2, D.parent_design, D.user_id, D.explanation, C.like_count, C.member_count, C.view_count, C.comment_count, U.nick_name, CD.order
       FROM opendesign.design D
         LEFT JOIN opendesign.design_counter C ON C.design_id = D.uid
         LEFT JOIN opendesign.user U ON U.uid = D.user_id
         LEFT JOIN opendesign.collection_design CD ON CD.design_id = D.uid
       WHERE D.uid NOT IN (SELECT CD.design_id FROM opendesign.collection_design CD)
       ) as T ORDER BY T.order IS NULL ASC, T.order ASC`;
  req.sql = sql
  next()
}

exports.getAllDesignTotalCount = (req, res, next) => {
  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM opendesign.design", (err, result) => {
        if (!err && result.length) {
          resolve(result[0]);
        } else {
          reject(err);
        }
      })
    })
  }

  getCount()
    .then(num => res.status(200).json(num))
    .catch(err => res.status(500).json(err))
}
