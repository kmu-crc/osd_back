const connection = require("../configs/connection");

const getRequestList = (req, res, next) => {
  const sql = req.sql;
  const getRequestList = sql => {
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
          reject(err);
        }
      });
    });
  };

  function newData(data) {
    // console.log("newData",data);
    return new Promise((resolve, reject) => {
      getMyThumbnail(data)
        .then(url => {
          data.imgURL = url;
          return data;
        })
        // .then(AreYouDesigner)
        // .then(designer => {
        // data.designer = designer;
        // return data;
        // })
        // .then(AreYouMaker)
        // .then(maker => {
        // data.maker = maker;
        // resolve(data);
        // })
        .then(resolve)
        .catch(err => {
          reject(err);
        });
    });
  };

  const AreYouMaker = userData => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT COUNT(*) AS 'exists' FROM market.expert WHERE \`type\` LIKE 'maker' AND user_id=${userData.uid}`;
      connection.query(sql, (err, row) => {
        if (!err && row && row[0]["exists"]) {
          resolve(true);
        } else {
          reject(false);
        }
      });
    });
  }
  const AreYouDesigner = userData => {
    return new Promise((resolve) => {
      const sql =
        `SELECT COUNT(*) AS 'exists' FROM market.expert WHERE \`type\` LIKE 'designer' AND user_id=${userData.uid}`;
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve(row[0]);
        } else {
          return err;
        }
      });
    });
  };
  function getMyThumbnail(data) {
    return new Promise((resolve, reject) => {
      if (!data.thumbnail) {
        resolve(null);
      } else {
        connection.query("SELECT s_img, m_img FROM market.thumbnail WHERE uid = ?", data.thumbnail, (err, row) => {
          if (!err && row.length === 0) {
            resolve(null);
          } else if (!err && row.length > 0) {
            resolve(row[0]);
          } else {
            return err;
          }
        });
      }
    });
  };

  getRequestList(sql)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

module.exports = getRequestList;
