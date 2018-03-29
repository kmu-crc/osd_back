var connection = require("../../configs/connection");

exports.insertDetail = (req, res) => {
  console.log("insert");
  req.body["user_id"] = req.decoded.uid;
  const insertDetailDB = (data) => {
    console.log("22");
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

  const updateThumbnail = () => {
    console.log("11");
    return new Promise((resolve, reject) => {
      let thumbnail = null;
      if (req.thumbnailId) {
        thumbnail = req.thumbnailId;
      }
      connection.query(`UPDATE user SET thumbnail=${thumbnail} WHERE uid=${req.decoded.uid}`, (err, rows) => {
        if (!err) {
          if (rows.affectedRows) {
            resolve(rows);
          } else {
            const err = "thumbnail 업데이트 실패";
            reject(err);
          }
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

  updateThumbnail()
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

  const updateThumbnail = () => {
    return new Promise((resolve, reject) => {
      console.log("222", req.thumbnailId);
      let thumbnail = null;
      if (req.thumbnailId) {
        thumbnail = req.thumbnailId;
      }
      connection.query(`UPDATE user SET thumbnail=${thumbnail} WHERE uid=${req.decoded.uid}`, (err, rows) => {
        if (!err) {
          if (rows.affectedRows) {
            resolve(rows);
          } else {
            const err = "thumbnail 업데이트 실패";
            reject(err);
          }
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

  updateThumbnail()
  .then(() => updateDetailDB(req.body))
  .then(respond)
  .catch(error);
};
