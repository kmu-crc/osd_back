var connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");

exports.createGroup = (req, res, next) => {
  console.log("createGroup");
  console.log("insert", req.file);
  req.body["user_id"] = req.decoded.uid;
  let groupId = null;

  const groupUpdata = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.group SET ? WHERE uid = ${groupId} `, {thumbnail: id}, (err, rows) => {
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
      connection.query("INSERT INTO opendesign.group SET ?", data, (err, rows) => {
        if (!err) {
          console.log("detail: ", rows);
          groupId = rows.insertId;
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    console.log("data", data);
    res.status(200).json({
      message: "성공적으로 등록되었습니다.",
      success: true,
      id: groupId
    });
  };

  insertDetailDB(req.body)
    .then(() => createThumbnails({ uid: req.decoded.uid, image: req.file }))
    .then(groupUpdata)
    .then(respond)
    .catch(next);
};
