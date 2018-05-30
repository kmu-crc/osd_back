var connection = require("../../configs/connection");

// 디자인 대표 카드 가져오기 (GET)
exports.designView = (req, res, next) => {
  const designId = req.params.id;

  // 완료된 카드 id 가져오기
  function getViewCard (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design_card WHERE design_id = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          const cardData = row[0];
          resolve(cardData);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 이미지 정보 가져오기
  function getImage (data) {
    const p = new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query("SELECT uid, name, link FROM design_images WHERE card_id = ?", data.uid, (err, row) => {
          if (!err && row.length === 0) {
            data.imageInfo = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.imageInfo = row[0];
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 첨부 파일 정보 가져오기
  function getSource (data) {
    const p = new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query("SELECT uid, name, link FROM design_source_file WHERE card_id = ?", data.uid, (err, row) => {
          if (!err && row.length === 0) {
            data.sourceInfo = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.sourceInfo = row[0];
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  };

  // 코멘트 가져오기
  function getComment (data) {
    const p = new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query("SELECT uid, user_id, comment, create_time FROM card_comment WHERE card_id = ?", data.uid, (err, row) => {
          if (!err && row.length === 0) {
            data.commentInfo = null;
            resolve(data);
          } else if (!err & row.length > 0) {
            data.commentInfo = row;
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
    return p;
  };

  getViewCard(designId)
    .then(getImage)
    .then(getSource)
    .then(getComment)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};
