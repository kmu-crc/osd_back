const connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");
const { insertSource } = require("../../middlewares/insertSource");
const { createBoard } = require("../design/designBoard");
const { createCard, updateCard } = require("../design/designCard");
const { joinMember } = require("../design/joinMember");

const updateDesignFn = (req) => {
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE design SET ? WHERE uid=${req.designId} AND user_id=${req.userId}`, req.data, (err, rows) => {
      if (!err) {
        if (rows.affectedRows) {
          resolve(rows);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    });
  });
};

exports.updateDesign = (req, res, next) => {
  console.log("updateDesign");
};

// 디자인 디테일 정보 가져오기 (GET)
exports.createDesign = (req, res, next) => {
  console.log("createDesign", req.files);
  console.log(typeof req.body.is_project);
  console.log(req.body.members);
  let members = JSON.parse(req.body.members);
  const userId = req.decoded.uid;
  req.body.user_id = userId;
  let designId = null;
  let cardId = null;
  if (members.length > 0) {
    members.push({uid: userId});
    req.body.is_members = 1;
  }
  delete req.body.members;

  const insertDesign = (data) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO design SET ?", data, (err, rows) => {
        if (!err) {
          designId = rows.insertId;
          resolve();
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = () => {
    res.status(200).json({
      success: true,
      design_id: designId,
      message: "성공적으로 등록되었습니다."
    });
  };

  const error = (err) => {
    next(err);
  };

  // 1. design 을 생성한다.
  // 2. 섬네일 이미지를 업로드 후 데이터베이스에 등록한다.
  // 3. 섬네일 이미지를 데이터베이스에 등록한 후 design 데이터에 thumbnail uid를 업데이트한다.
  // 4. is_project가 true이면 respond 하고 false이면 createBorad 로직을 실행한다.
  // 5. createBorad 가 성공적으로 완료되면 CreateCard 로직을 실행한다.
  // 6. card가 성공적으로 생성되었다면 source파일을 업로드 한다.
  insertDesign(req.body)
    .then(() => {
      return createThumbnails({ uid: userId, image: req.files.thumbnail[0] });
    })
    .then((thumbnailId) => {
      return updateDesignFn({
        designId,
        userId,
        data: {
          thumbnail: thumbnailId
        }
      });
    })
    .then(() => {
      return joinMember({design_id: designId, members});
    })
    .then(() => {
      console.log(typeof req.body.is_project)
      if (req.body.is_project) return;
      return createBoard({
        user_id: userId,
        design_id: designId,
        order: 0,
        title: req.body.title
      });
    })
    .then((boardId) => {
      if (req.body.is_project) return;
      return createCard({
        design_id: designId,
        board_id: boardId,
        user_id: userId,
        title: req.body.title,
        content: req.body.explanation,
        order: 0
      });
    })
    .then((id) => {
      cardId = id;
      if (req.body.is_project) return;
      insertSource({ uid: userId, card_id: id, tabel: "design_source_file", files: req.files["source_file[]"] });
    })
    .then((data) => {
      if (req.body.is_project) return;
      let is_source = 0;
      if (data !== null) is_source = 1;
      return updateCard({ userId, cardId, data: {is_source} });
    })
    .then(() => {
      if (req.body.is_project) return;
      insertSource({ uid: userId, card_id: cardId, tabel: "design_images", files: req.files["design_file[]"] });
    })
    .then((data) => {
      if (req.body.is_project) return;
      let is_images = 0;
      if (data !== null) is_images = 1;
      return updateCard({ userId, cardId, data: {is_images} });
    })
    .then(respond)
    .catch(next);
}
