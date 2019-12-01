var connection = require("../../configs/connection");

// 디자인 대표 카드 가져오기 (GET)
exports.designView = (req, res, next) => {
  const designId = req.params.id;
  let loginId;
  if (req.decoded !== null) {
    loginId = req.decoded.uid;
  } else {
    loginId = null;
  }

  // 완료된 카드 id 가져오기
  function getViewCard(id) {
    console.log("getViewCard");
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design_card WHERE design_id = ?", id, (err, row) => {
        if (!err && row.length === 0) {
          resolve({});
        } else if (!err && row.length > 0) {
          const cardData = row[0];
          resolve(cardData);
        } else {
          reject(err);
        }
      });
    });
  };

  // 이미지 정보 가져오기
  function getImage(data) {
    console.log("getImage");
    return new Promise((resolve, reject) => {
      if (data === null) {
        resolve(null);
      } else {
        connection.query("SELECT uid, name, link FROM design_images WHERE card_id = ?", data.uid, (err, row) => {
          if (!err && row.length === 0) {
            data.images = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.images = row;
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
  };

  // 첨부 파일 정보 가져오기
  function getSource(data) {
    console.log("getSource");
    return new Promise((resolve, reject) => {
      if (data === null) {
        resolve({});
      } else {
        connection.query("SELECT uid, name, link FROM design_source_file WHERE card_id = ?", data.uid, (err, row) => {
          if (!err && row.length === 0) {
            data.sources = null;
            resolve(data);
          } else if (!err && row.length > 0) {
            data.sources = row;
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
  };

  // 내가 멤버인지 (수정 권한이 있는지) 검증하기
  function isTeam(data) {
    console.log("isTeam");
    return new Promise((resolve, reject) => {
      if (loginId === null) {
        data.is_team = 0;
        resolve(data);
      } else {
        connection.query(`SELECT * FROM design_member WHERE design_id = ${designId} AND user_id = ${loginId}`, (err, result) => {
          if (!err && result.length === 0) {
            data.is_team = 0;
            resolve(data);
          } else if (!err && result.length > 0) {
            data.is_team = 1;
            resolve(data);
          } else {
            reject(err);
          }
        });
      }
    });
  };

  // 코멘트 가져오기
  // function getComment (data) {
  //   const p = new Promise((resolve, reject) => {
  //     if (data === null) {
  //       resolve(null);
  //     } else {
  //       connection.query("SELECT C.uid, C.user_id, C.comment, C.create_time, C.update_time, U.nick_name, T.s_img FROM card_comment C LEFT JOIN user U ON U.uid = C.user_id LEFT JOIN thumbnail T ON T.uid = U.thumbnail WHERE C.card_id = ?", data.uid, (err, row) => {
  //         if (!err && row.length === 0) {
  //           data.commentInfo = null;
  //           resolve(data);
  //         } else if (!err & row.length > 0) {
  //           data.commentInfo = row;
  //           resolve(data);
  //         } else {
  //           reject(err);
  //         }
  //       });
  //     }
  //   });
  //   return p;
  // };

  getViewCard(designId)
    .then(getImage)
    .then(getSource)
    .then(isTeam)
    // .then(getComment)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};
