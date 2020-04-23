const connection = require("../../configs/connection");

exports.groupList = (req, res, next) => {
  const page = req.params.page;
  const keyword = req.params.keyword;

  let sort;
  if (req.params.sorting !== "null" && req.params.sorting !== undefined && req.params.sorting !== "undefined") {
    sort = req.params.sorting;
  } else {
    sort = "update";
  }

  // let sql = `SELECT
  //           G.uid, G.title, G.thumbnail, G.create_time, G.child_update_time, G.user_id, G.explanation, C.like, C.design, C.group, U.nick_name
  //           FROM opendesign.group G
  //           LEFT JOIN group_counter C ON C.group_id = G.uid
  //           JOIN user U ON U.uid = G.user_id`;
  // if (keyword && keyword !== "null" && keyword !== "undefined") {
  //   sql = sql + ` WHERE G.title LIKE "%${keyword}%" OR U.nick_name LIKE "%${keyword}%"`;
  // }
  // if (sort === "update") {
  //   sql = sql + " ORDER BY G.child_update_time DESC LIMIT " + (page * 10) + ", 10";
  // } else if (sort === "create") {
  //   sql = sql + " ORDER BY G.create_time DESC LIMIT " + (page * 10) + ", 10";
  // } else if (sort === "like") {
  //   sql = sql + " ORDER BY C.like DESC LIMIT " + (page * 10) + ", 10";
  // }
  // req.sql = sql;

  let sql2 = `SELECT
  G.uid, G.title, G.thumbnail, G.create_time, G.child_update_time, G.user_id, G.explanation, C.like, C.design, C.group, U.nick_name
  FROM opendesign.group G
  LEFT JOIN group_counter C ON C.group_id = G.uid
  LEFT JOIN user U ON U.uid = G.user_id`;
  // 0. nothing
  // 1. keyword
  
  if ((keyword && keyword !== "null" && keyword !== "undefined")) {
    sql2 = sql2 + ` WHERE `;
  }

  if (keyword && keyword !== "null" && keyword !== "undefined") {
    const ary = keyword.trim().split(" ");
    ary.length > 0 && ary.map((word, index) => {
      if (word !== "") {
        if (index !== 0) {
          sql2 = sql2 + ` AND `;
        }
        sql2 = sql2 + ` G.title LIKE "%${word}%" `;
      }
      return word;
    });
  }
  sql2 = sql2 + `
  ORDER BY ${ sort === "update" ? "D.update_time" : sort === "create" ? "D.create_time" : "D.like_count"} DESC
  LIMIT ${ page * 10}, 10;`;
  req.sql = sql2;

  next();
};

exports.getTotalCount = (req, res, next) => {
  const getCount = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM opendesign.group G", (err, result) => {
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
