const connection = require("../../configs/connection");
const { thumbnailModule } = require("../../middlewares/thumbnailModule");
const { insertSource } = require("../../middlewares/insertSource");

// 디자인 디테일 정보 가져오기 (GET)
exports.createDesign = (req, res, next) => {
  const userId = req.decoded.uid;
  req.body.user_id = userId;
  let designId = null;
  let boardId = null;
  let cardId = null;
  let boardObj = {
    user_id: userId,
    title: req.body.title,
    order: 0
  };
  let cardObj = {
    user_id: userId,
    title: req.body.title,
    content: req.body.explanation,
    order: 0
  };
  let updateCardObj = {};

  const insertDesign = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO design SET ?", data, (err, rows) => {
        if (!err) {
          designId = rows.insertId;
          boardObj.design_id = designId;
          cardObj.design_id = designId;
          resolve(rows.insertId);
        } else {
          reject(err);
        }
      });
    });
  };

  const updateDesign = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design SET ? WHERE uid=${designId} AND user_id=${userId}`, data, (err, rows) => {
        if (!err) {
          if (rows.affectedRows) {
            resolve(rows);
          } else {
            const err = "작성자 본인이 아닙니다.";
            reject(err);
          }
        } else {
          reject(err);
        }
      });
    });
  };

  const createBoard = (data) => {
    return new Promise((resolve, reject) => {
      console.log("createBoard", data);
      connection.query("INSERT INTO design_board SET ?", data, (err, rows) => {
        if (!err) {
          console.log(rows);
          boardId = rows.insertId;
          cardObj.board_id = boardId;
          resolve(rows.insertId);
        } else {
          reject(err);
        }
      });
    });
  };

  const createCard = (data) => {
    return new Promise((resolve, reject) => {
      console.log("createCard", data);
      connection.query("INSERT INTO design_card SET ?", data, (err, rows) => {
        if (!err) {
          cardId = rows.insertId;
          resolve(rows.insertId);
        } else {
          reject(err);
        }
      });
    });
  };

  const updateCard = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_card SET ? WHERE uid=${cardId} AND user_id=${userId}`, data, (err, rows) => {
        if (!err) {
          if (rows.affectedRows) {
            resolve(rows);
          } else {
            const err = "작성자 본인이 아닙니다.";
            reject(err);
          }
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      design_id: designId,
      message: "성공적으로 등록되었습니다."
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  insertDesign(req.body).then(
    () => thumbnailModule({uid: userId, image: req.files.thumbnail[0]})
  ).then(
    thumbnailId => updateDesign({thumbnail: thumbnailId})
  ).then(
    () => createBoard(boardObj)
  ).then(
    () => createCard(cardObj)
  ).then(
    () => {
      if (req.body.is_project === 1) return null;
      return insertSource({uid: userId, card_id: cardId, tabel: "design_images", files: req.files["design_file[]"]});
    }
  ).then(
    (data) => {
      if (req.body.is_project === 1) return null;
      let is_images = 0;
      if (data !== null) is_images = 1;
      return updateCard({is_images});
    }
  ).then(
    (data) => {
      if (req.body.is_project === 1) return null;
      return insertSource({uid: userId, card_id: cardId, tabel: "design_source_file", files: req.files["source_file[]"]});
    }
  ).then(
    (data) => {
      if (req.body.is_project === 1) return null;
      let is_source = 0;
      if (data !== null) is_source = 1;
      return updateCard({is_source});
    }
  ).then(respond).catch(error);
}
