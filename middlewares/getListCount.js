const connection = require("../configs/connection");

const getListCount = (req, res, next) => {
  const sql = req.sql;
  // //console.log(sql);
  // 디자인 리스트 가져오기 (GET)
  function getList (sql) {
    return new Promise((resolve, reject) => {
      let arr = [];
      connection.query(sql, (err, row) => {
        if (!err) {
          //date.uid = row.insertId;
          resolve(row.number);
        } else {
          console.log(err);
          reject(err);
        }
        // if (!err && row.length === 0) {
        //   resolve(null);
        // } else if (!err && row.length > 0) {
        //   row.map(data => {
        //     arr.push(newData(data));
        //   });
        //   Promise.all(arr).then(result => {
        //     resolve(result);
        //   });
        // } else {
        //   reject(err);
        // }
      });
    });
  };

  getList(sql)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => res.status(500).json(err));
};

module.exports = getListCount;
