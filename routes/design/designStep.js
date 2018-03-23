var connection = require("../../configs/connection");

// 디자인 스텝 보드 가져오기 (GET)
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
          data.cardData.cardCount = result[0];
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
    .then(arr => res.status(200).json(arr));
};

// **********************************************************

// 디자인 스텝 카드 디테일 가져오기 (GET)
exports.designCardDetail = (req, res, next) => {
  const cardId = req.params.card_id;

  // 카드 디테일 내용 가져오기
  function getCardDetail (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design_card WHERE uid = ?", cardId, (err, data) => {
        if (!err) {
          let cardData = data[0];
          resolve(cardData);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 카드 안에 있는 이미지 정보 가져오기
  function getImage (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM design_images WHERE card_id = ?", id, (err, row) => {
        if (!err) {
          data.imageInfo = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 카드 안에 있는 첨부 파일 정보 가져오기
  function getSource (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM design_source_file WHERE card_id = ?", id, (err, row) => {
        if (!err) {
          data.srcInfo = row[0];
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  getCardDetail(cardId)
    .then(getImage)
    .then(getSource)
    .then(data => res.status(200).json(data));
};

// **********************************************************

// 디자인 스텝 보드 생성 (POST)
exports.createBoard = (req, res, next) => {
  const designId = req.params.id;
  const { userId, title, order } = req.body;

  let newData = {
    "user_id": userId,
    "design_id": designId,
    "title": title,
    "order": order
  };

  if (userId) {
    isMember(userId);
  }

  // 해당 디자인의 멤버인지 판별
  function isMember (userId) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT count(*) FROM design_member WHERE user_id = ? AND design_id = ?", userId, designId, (err, result) => {
        if (!err) {
          if (result > 0) {
            createNewBoard(newData);
          } else if (result === 0) {
            res.json({
              message: "멤버가 아닙니다."
            });
          }
        } else {
          reject(err);
        }
      });
    });
    return p;
  }

  // 보드 생성 함수
  function createNewBoard (data) {
    connection.query("INSERT INTO design_board SET = ?", data, (err, result) => {
      if (!err) {
        res.status(200);
      } else {
        res.status(500).json(err);
      }
    });
  }
};
