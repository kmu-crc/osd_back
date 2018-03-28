var connection = require("../../configs/connection");

exports.insertDetail = (req, res) => {
  const insertDetailDB = (data) => {
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
    return new Promise((resolve, reject) => {
      let thumbnail = null;
      if (req.thumbnailId) {
        thumbnail = req.thumbnailId;
      }
      connection.query(`UPDATE user SET thumbnail=${thumbnail} WHERE uid=${req.decoded.uid}`, (err, rows) => {
        if (!err) {
          console.log("thumbnail:", rows);
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

  updateThumbnail()
  .then(() => insertDetailDB(req.body))
  .then(respond)
  .catch(error);
};
