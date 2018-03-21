var connection = require("../../configs/connection");

exports.designStep = (req, res, next) => {
  const designId = req.params.id;
  let arr = [];

  // board 목록 가져오기
  function getBoardList (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design_board WHERE design_id = ?", id, (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            let boardData = row[i];
            resolve(boardData);
          }
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 해당 board에 속한 card 가져오기
  function getCardList (data) {
    const p = new Promise((resolve, reject) => {
      const boardId = data.uid;
      connection.query("SELECT * FROM design_card WHERE board_id = ?", boardId, (err, row) => {
        if (!err) {
          data.cardData = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // board 안에 있는 각 card들의 댓글 수 가져오기
  function getCardCount (data) {
    const p = new Promise((resolve, reject) => {
      const cardId = data.cardData.uid;
      connection.query("SELECT comment_count FROM card_counter WHERE card_id = ?", cardId, (err, result) => {
        if (!err) {
          data.cardData.cardCount = result;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  getBoardList(designId)
    .then(getCardList)
    .then(getCardCount)
    .then(data => arr.push(data))
    .then(arr => res.json(arr));
};
