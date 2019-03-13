const connection = require("../../configs/connection");
const { insertSource } = require("../../middlewares/insertSource");
const { createBoardDB } = require("../design/designBoard");
const { createCardDB, updateCardDB } = require("../design/designCard");

exports.createDesignView = (req, res, next) => {
  const userId = req.decoded.uid;
  const designId = req.params.id;
  let cardId = null;

  const respond = () => {
    res.status(200).json({
      success: true,
      design_id: designId,
      message: "성공적으로 등록되었습니다."
    });
  };

  const error = (err) => {
    console.log("err", err);
    next(err);
  };

  createBoardDB({
    user_id: userId,
    design_id: designId,
    order: 0,
    title: req.body.title
  }).then((boardId) => {
    return createCardDB({
      design_id: designId,
      board_id: boardId,
      user_id: userId,
      title: req.body.title,
      content: req.body.explanation,
      order: 0
    });
  }).then((cardId) => {
    insertSource({ uid: userId, card_id: cardId, tabel: "design_source_file", files: req.files["source_file[]"] });
  }).then((data) => {
    let is_source = 0;
    if (data !== null) is_source = 1;
    return updateCardDB({ userId, cardId, data: {is_source} });
  }).then(() => {
    insertSource({ uid: userId, card_id: cardId, tabel: "design_images", files: req.files["design_file[]"] });
  }).then((data) => {
    let is_images = 0;
    if (data !== null) is_images = 1;
    return updateCardDB({ userId, cardId, data: {is_images} });
  }).then(respond)
    .catch(error);
};
