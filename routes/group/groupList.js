const connection = require("../../configs/connection");

exports.groupList = (req, res, next) => {
  const page = req.params.page;
  let sort;
  const keyword = req.params.keyword;

  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }

  let sql;

  if (keyword && keyword !== "null" && keyword !== "undefined") {
    sql = `SELECT
      G.uid, G.title, G.thumbnail, G.create_time, G.child_update_time, G.user_id, G.explanation, C.like, C.design, C.group
      FROM opendesign.group G
      LEFT JOIN group_counter C ON C.group_id = G.uid`;
    sql = sql + ` WHERE G.title LIKE "%${keyword}%"`;
  } else {
    sql = `SELECT
      G.uid, G.title, G.thumbnail, G.create_time, G.child_update_time, G.user_id, G.explanation, C.like, C.design, C.group
      FROM opendesign.group G
      LEFT JOIN group_counter C ON C.group_id = G.uid
      WHERE NOT EXISTS
      (SELECT J.group_id FROM group_join_group J WHERE J.group_id = G.uid)`;
  }

  if (sort === "update") {
    sql = sql + " ORDER BY G.child_update_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "create") {
    sql = sql + " ORDER BY G.create_time DESC LIMIT " + (page * 10) + ", 10";
  } else if (sort === "like") {
    sql = sql + " ORDER BY C.like DESC LIMIT " + (page * 10) + ", 10";
  }
  req.sql = sql;
  next();
};

exports.getTotalCount = (req, res, next) => {
  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM opendesign.group G WHERE NOT EXISTS (SELECT J.group_id FROM group_join_group J WHERE J.group_id = G.uid)", (err, result) => {
        if (!err && result.length) {
          console.log(result);
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
