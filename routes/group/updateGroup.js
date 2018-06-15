var connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");

exports.updateGroup = (req, res, next) => {
  console.log(req.body);
  console.log(req.file);
  const groupId = req.params.id;

  const updateGroup = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.group SET ? WHERE uid = ${groupId}`, data, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          console.log(err);
          reject(result);
        }
      });
    });
  };

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

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  updateGroup(req.body)
    .then(() => createThumbnails({ uid: req.decoded.uid, image: req.file }))
    .then(groupUpdata)
    .then(success)
    .catch(fail);
};
