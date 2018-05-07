var connection = require("../../configs/connection");

// 디자인 스텝 보드 가져오기 (GET)
exports.designStep = (req, res, next) => {
  const designId = req.params.id;

  // board 목록 가져오기
  function getBoardList (id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      connection.query("SELECT * FROM design_board WHERE design_id = ?", id, (err, row) => {
        if (!err) {
          for (var i = 0, l = row.length; i < l; i++) {
            arr.push(new Promise((resolve, reject) => {
              let boardData = row[i];
              let sql = "SELECT D.uid, D.user_id, U.nick_name, D.first_img, D.title, D.order, D.is_complete_card, D.update_time, C.comment_count FROM design_card D JOIN card_counter C ON D.uid = C.card_id JOIN user U ON D.user_id = U.uid WHERE board_id = ?";
              if (!err) {
                connection.query(sql, boardData.uid, (err, row) => {
                  if (!err) {
                    boardData.cardData = row;
                    resolve(boardData);
                  } else {
                    reject(err);
                  }
                });
              }
            }));
          }
          Promise.all(arr).then(result => {
            resolve(result);
          });
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getBoardList(designId)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
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
          let cardData = data;
          resolve(cardData);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 카드 안에 있는 이미지 정보 가져오기
  function getImage (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM design_images WHERE card_id = ?", id, (err, row) => {
        if (!err) {
          data.imageInfo = row;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  // 카드 안에 있는 첨부 파일 정보 가져오기
  function getSource (data) {
    const p = new Promise((resolve, reject) => {
      const id = data.uid;
      connection.query("SELECT * FROM design_source_file WHERE card_id = ?", id, (err, row) => {
        if (!err) {
          data.srcInfo = row;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  getCardDetail(cardId)
    .then(getImage)
    .then(getSource)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(500).json(err));
};

// **********************************************************

// 디자인 스텝 보드 생성 (POST)
exports.createBoard = (req, res, next) => {
  const designId = req.params.id;
  const { title, order } = req.body;
  const date = new Date();

  let newData = {
    "design_id": designId,
    "title": title,
    "order": order,
    "create_time": date
  };

  // 보드 생성 함수
  function createNewBoard (data) {
    connection.query("INSERT INTO design_board SET ?", data, (err, result) => {
      if (!err) {
        res.status(200);
      } else {
        res.status(500).json(err);
      }
    });
  };

  createNewBoard(newData);
};
