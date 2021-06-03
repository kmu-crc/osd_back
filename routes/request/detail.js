const connection = require("../../configs/connection");

exports.RequestDetail = (req, res, next) => {
  const id = req.params.id;

  // get board detail
  const getRequestDetail = (id) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM market.request WHERE uid=${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row.length ? row[0] : null);
        } else {
          reject(err);
        }
      });
    });
  };
  // getRequestDetailIfIsAnswer
  const getRequestDetailIfIsAnswer = (data) => {
    return new Promise((resolve, reject) => {
      // skip
      if (data.sort_in_group === 0) {
        resolve(data);
      }
      else {
        const sql = `SELECT * FROM market.request WHERE uid=${data.group_id}`;
        connection.query(sql, (err, row) => {
          if (!err) {
            data.request = row[0];
            resolve(data);
          } else {
            reject(err);
          }
        }
        )
      }
    })
  }
  // 이름
  const getName = (data) => {
    return new Promise((resolve, reject) => {
      const sql = data.sort_in_group === 0 ?
        `SELECT nick_name FROM market.user WHERE uid=${data.client_id};` :
        `SELECT U.nick_name,D.nick_name as 'client_name' FROM market.user U
        INNER JOIN market.user D ON D.uid = ${data.client_id}
        WHERE U.uid=${data.expert_id};`;
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          data.nick_name = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.nick_name = row[0]["nick_name"];
          if(data.sort_in_group!=0){
            data.client_name = row[0]["client_name"]
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };
  // user_id
  const getUserId= (data) => {
    return new Promise((resolve, reject) => {
      const sql = data.sort_in_group === 0 ?
        `SELECT uid AS user_id FROM market.user WHERE uid=${data.client_id};` :
        `SELECT U.uid, D.uid AS user_id FROM market.user U
        INNER JOIN market.user D ON D.uid = ${data.client_id}
        WHERE U.uid=${data.expert_id};`;
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          data.user_id = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.user_id = row[0]["user_id"];
          if(data.sort_in_group!=0){
            data.user_id = row[0]["user_id"]
          }
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };


  // 프로필 썸네일 가져오기
  const getThumbnail = (data) => {
    return new Promise((resolve, reject) => {
      const sql = data.sort_in_group === 0 ?
        `SELECT s_img, m_img, l_img FROM thumbnail WHERE uid IN(SELECT thumbnail FROM market.user WHERE uid=${data.client_id});` :
        `SELECT s_img, m_img, l_img FROM thumbnail WHERE uid IN(SELECT thumbnail FROM market.user WHERE uid=${data.expert_id});`
      connection.query(sql, (err, row) => {
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
        sql = `SELECT name FROM market.category_level2 WHERE parents_id=${data.category_level1} AND value=${data.category_level2}`;
      } else {
        cate = data.category_level1;
        sql = `SELECT name FROM market.category_level1 WHERE uid = ${data.category_level1}`;
      }
      connection.query(sql, cate, (err, result) => {
        if (!err) {
          data.categoryName = result[0] ? result[0].name : "";
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  getRequestDetail(id)
    .then(getRequestDetailIfIsAnswer)
    .then(getThumbnail)
    .then(getCategory)
    .then(getName)
	.then(getUserId)
    // .then(getCountView)
    // .then(getCountLike)
    .then(result => {
      res.status(200).json(result)
    })
    .catch(err =>
      res.status(500).json(err)
    );
};

 // // COUNTER
  // const getCountLike = (data) => {
  //   return new Promise((resolve, reject) => {
  //     connection.query(`SELECT COUNT(*) FROM market.request_like WHERE board_id=${data.uid};`, (err, row) => {
  //       if (!err && row.length === 0) {
  //         data.likes = null;
  //         resolve(data);
  //       } else if (!err && row.length > 0) {
  //         data.likes = row[0]["COUNT(*)"];
  //         resolve(data);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   });
  // };
  // const getCountView = (data) => {
  //   return new Promise((resolve, reject) => {
  //     connection.query(`SELECT views FROM market.request_view WHERE board_id=${data.uid};`, (err, row) => {
  //       if (!err && row.length === 0) {
  //         data.view = null;
  //         resolve(data);
  //       } else if (!err && row.length > 0) {
  //         data.view = row[0]["views"];
  //         resolve(data);
  //       } else {
  //         reject(err);
  //       }
  //     });
  //   });
  // };
