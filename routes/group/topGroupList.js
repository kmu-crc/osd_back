const connection = require("../../configs/connection");

exports.topGroupList = (req, res, next) => {
  const page = req.params.page;
  let sort;
  const keyword = req.params.keyword;

  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }

  let sql = `
  SELECT
    G.uid, G.title, G.thumbnail, G.create_time, G.child_update_time, G.user_id, G.explanation
    , C.like, C.design, C.group
    , U.nick_name
    , CG.order
    FROM opendesign.group G
      LEFT JOIN opendesign.group_counter C ON C.group_id = G.uid
      LEFT JOIN opendesign.user U ON U.uid = G.user_id
      LEFT JOIN opendesign.collection_group CG ON CG.uid = G.uid
    WHERE G.uid IN (
      SELECT CG.group_id FROM opendesign.collection_group CG)
    ORDER BY CG.order ASC, `;
/*
  if (keyword && keyword !== "null" && keyword !== "undefined") {
    sql = sql + ` WHERE G.title LIKE "%${keyword}%" OR U.nick_name LIKE "%${keyword}%"`;
  }
*/
  if (sort === "update") {
    sql = sql + " G.child_update_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "create") {
    sql = sql + " G.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " C.like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

exports.getTopTotalCount = (req, res, next) => {
  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM opendesign.collection_group G", (err, result) => {
        if (!err && result.length) {
          //console.log(result);
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
