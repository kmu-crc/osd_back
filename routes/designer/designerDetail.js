var connection = require("../../configs/connection");

exports.designerDetail = (req, res, next) => {
  const id = req.params.id;

  // 디자이너 정보 가져오기 (GET)
  function getDesignerInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT U.uid, U.nick_name, D.category_level1, D.category_level2 FROM user U JOIN user_detail D ON U.uid = D.user_id WHERE U.uid = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          let data = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 디자이너 프로필 썸네일 가져오기
  function getMyThumbnail (data) {
    const p = new Promise((resolve, reject) => {
      connection.queyr("SELECT s_img, m_img FROM thumbnail WHERE user_id = ?", data.uid, (err, row) => {
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
    return p;
  };

  // 디자이너 count 정보 가져오기 (GET)
  function getDesignerCount (data) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT total_like, total_design, total_group, total_view FROM user_counter WHERE user_id = ?", data.uid, (err, row) => {
        if (!err && row.length === 0) {
          data.count = null;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.count = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getDesignerInfo(id)
    .then(getMyThumbnail)
    .then(getDesignerCount)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json(err));
};
