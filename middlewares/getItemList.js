const connection = require("../configs/connection");

const getItemList = (req, res, next) => {
  const sql = req.sql;
  // console.log(sql);
  function getList(sql) {
    return new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          row.map(data => {
            arr.push(newData(data));
          });
          Promise.all(arr).then(result => {
            resolve(result);
          });
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };

  function newData(data) {
    return new Promise((resolve, reject) => {
      getUserName(data).then(name => {
        data.userName = name;
        return data;
      }).then(
        getPrice
      ).then(price => {
        data.price = price;
        return data;
      }).then(
        getThumbnail
      ).then(url => {
        data.thumbnail = url;
        return data;
      }).then(async data => {
        data.reviews = await getReviews(data.uid);
        return data;
      }).then(async data => {
        data.score = await getScore(data.uid);
        return data;
      }).then(async data => {
        data.members = await getMemberList(data.uid);
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  };

  // 유저 닉네임 가져오는 함수
  function getUserName(data) {
    return new Promise((resolve, reject) => {
      if (data.user_id === null) {
        resolve(null);
      } else {
        connection.query("SELECT nick_name FROM market.user WHERE uid = ?", data.user_id, (err, rows) => {
          if (!err) {
            resolve(rows[0]["nick_name"]);
          } else {
            reject(err);
          }
        });
      }
    });
  };
  // 아이템 가격 가져오는 함수
  function getPrice(data) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT price FROM market.\`item-detail\` WHERE \`item-id\`=${data.uid};`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0] ? row[0].price : null);
        } else {
          reject(err);
        }
      });
    });
  };
  // 디자인 썸네일 가져오는 함수
  function getThumbnail(data) {
    return new Promise((resolve, reject) => {
      if (data.thumbnail_id === null) {
        resolve(null);
      } else {
        connection.query(`SELECT m_img FROM market.thumbnail WHERE uid = ?`, data.thumbnail_id, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0] ? row[0]["m_img"] : null);
          } else {
            reject(err);
          }
        });
      }
    });
  }
  // get score
  function getScore(id) {
    return new Promise((resolve, reject) => {
      connection.query(`
      SELECT AVG(score) AS "score" FROM market.review R
      WHERE item_id=${id}`, (err, rows) => {
        if (!err) {
          resolve(rows[0]["score"] || 0);
        } else {
          reject(err);
        }
      }
      );
    })
  }
  // get review
  function getReviews(id) {
    return new Promise((resolve, reject) => {
      connection.query(`
      SELECT COUNT(*) AS 'reviews' 
      FROM market.review WHERE item_id=${id}`, (err, rows) => {
        if (!err) {
          resolve(rows[0]["reviews"]);
        } else {
          reject(err);
        }
      }
      );
    })
  }
  // get member
  function getMemberList(id) {
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT user_id 
          FROM market.member WHERE item_id=${id}`, (err, rows) => {
        if (!err) {
          resolve(rows || null);
        } else {
          reject(err);
        }
      }
      );
    })

  }
  getList(sql)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

module.exports = getItemList;
