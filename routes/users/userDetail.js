const connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");

exports.insertDetail = (req, res) => {
  console.log("insert", req.file);
  req.body["user_id"] = req.decoded.uid;
  if (req.body.is_designer) {
    req.body.is_designer = 1;
  } else {
    req.body.is_designer = 0;
  }
  const userUpdata = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user SET ? WHERE uid = ${req.decoded.uid} `, {thumbnail: id}, (err, rows) => {
        if (!err) {
          console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const insertDetailDB = (data) => {
    console.log("22", data);
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO user_detail SET ?", data, (err, rows) => {
        if (!err) {
          console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      message: "성공적으로 등록되었습니다."
    });
  };

  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  createThumbnails({ uid: req.decoded.uid, image: req.file })
    .then(userUpdata)
    .then(() => insertDetailDB(req.body))
    .then(respond)
    .catch(error);
};

exports.modifyDetail = (req, res) => {
  const updateDetailDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user_detail SET ? WHERE uid=${req.body.uid} AND user_id=${req.decoded.uid}`, data, (err, rows) => {
        if (!err) {
          if (rows.affectedRows) {
            resolve(rows);
          } else {
            const err = "작성자 본인이 아닙니다.";
            reject(err);
          }
        } else {
          reject(err);
        }
      });
    });
  };

  const userUpdata = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user SET ? WHERE uid = ${req.decoded.uid} `, {thumbnail: id}, (err, rows) => {
        if (!err) {
          console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      message: "성공적으로 업데이트되었습니다."
    });
  };

  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  createThumbnails({ uid: req.decoded.uid, image: req.file })
    .then(userUpdata)
    .then(() => updateDetailDB(req.body))
    .then(respond)
    .catch(error);
};
