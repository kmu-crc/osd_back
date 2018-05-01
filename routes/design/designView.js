var connection = require("../../configs/connection");

// 디자인 대표 카드 가져오기 (GET)
exports.designView = (req, res, next) => {
  const designId = req.params.id;

  // 완료된 카드 id 가져오기
  function getViewCardId (designId) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT uid FROM design_card WHERE is_complete_card = true AND design_id = ?", designId, (err, result) => {
        if (!err && result.length === 0) {
          resolve(null);
        } else if (!err && result.length > 0) {
          const cardId = result[0];
          resolve(cardId.uid);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 받아온 카드 id로 카드 정보 가져오기
  function getViewCard (id) {
    const p = new Promise((resolve, reject) => {
      if (id === null) {
        resolve(null);
      } else {
        connection.query("SELECT * FROM design_card WHERE uid = ?", id, (err, row) => {
          if (!err) {
            let cardData = row[0];
            resolve(cardData);
          } else {
            reject(err);
          }
        });
      }
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
          if (!err) {
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
          if (!err) {
            data.sourceInfo = row;
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
        connection.query("SELECT uid, user_id, comment, update_time FROM card_comment WHERE card_id = ?", data.uid, (err, row) => {
          if (!err) {
            data.commentInfo = row;
            resolve(data);
          } else {
            reject(err);
            console.log(err);
          }
        });
      }
    });
    return p;
  };

  getViewCardId(designId)
    .then(getViewCard)
    .then(getImage)
    .then(getSource)
    .then(getComment)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};
