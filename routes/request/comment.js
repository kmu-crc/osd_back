const connection = require("../../configs/connection");

exports.GetComment = (req, res, next) => {
  const id = req.params.id;

  const getComment = id => {
    return new Promise((resolve, reject) => {
      const sql =
        `SELECT 
      C.uid, C.user_id, C.board_id, C.comment, C.create_time, C.update_time, C.d_flag,
      U.nick_name, T.s_img 
      FROM opendesign.request_comment C 
      LEFT JOIN user U ON U.uid = C.user_id 
      LEFT JOIN thumbnail T ON T.uid = U.thumbnail 
      WHERE C.board_id = ${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  };

  const success = data => { res.status(200).json({ success: true, data: data }) };
  const fail = err => { res.status(500).json({ success: false, data: err }) };

  getComment(id)
    .then(success)
    .catch(fail);
};

exports.RemoveComment = (req, res, next) => {
  const id = req.params.id;

  const removeComment = id => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM opendesign.request_comment WHERE uid=${id}`;
      // console.log(sql);
      connection.query(sql, (err, row) => {
        if (!err) {
          console.log(row);
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  };

  const success = data => { res.status(200).json({ success: true, data: data }) };
  const fail = err => { res.status(500).json({ success: false, data: err }) };

  removeComment(id)
    .then(success)
    .catch(fail);
};

exports.CreateComment = (req, res, next) => {
  const id = req.params.id;
  const data = req.body;
  const removeComment = id => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO opendesign.request_comment SET ?`;
      console.log(sql,data);
      connection.query(sql, data, (err, row) => {
        if (!err) {
          console.log(row);
          resolve(row);
        } else {
          reject(err);
        }
      });
    });
  };

  const success = data => { res.status(200).json({ success: true, data: data }) };
  const fail = err => { res.status(500).json({ success: false, data: err }) };

  removeComment(id)
    .then(success)
    .catch(fail);
};
