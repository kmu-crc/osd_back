const connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");
const { insertSource } = require("../../middlewares/insertSource");
const { createBoardDB } = require("../design/designBoard");
const { createCardDB, updateCardDB } = require("../design/designCard");
const { joinMember } = require("../design/joinMember");

// 디자인 생성
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

// 디자인 디테일 정보 등록
exports.createDesign = (req, res, next) => {
  console.log("createDesign", req.files);

  if (req.body.category_level1 === 0) {
    req.body.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    req.body.category_level2 = null;
  }
  let members = JSON.parse(req.body.members);
  const userId = req.decoded.uid;
  req.body.user_id = userId;
  let designId = null;
  let cardId = null;
  // if (members.length > 0) {
  //   members.push({uid: userId});
  //   req.body.is_members = 1;
  // }
  members.push({uid: userId});
  req.body.is_members = 1;
  req.body["is_public"] = 1;
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

  // 디자인 count 정보 등록
  const insertDesignCount = (data) => {
    console.log(data);
    return new Promise((resolve, reject) => {
      const newCount = { design_id: designId, like_count: 0, view_count: 0 };
      connection.query("INSERT INTO design_counter SET ? ", newCount, (err, row) => {
        if (!err) {
          resolve(designId);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // 디자인 count에 카드수, 멤버수 업데이트
  const updateDesignCount = () => {
    return new Promise((resolve, reject) => {
      const newCount = { card_count: req.body.is_project ? 0 : 1, member_count: members.length };
      connection.query(`UPDATE design_counter SET ? WHERE design_id = ${designId}`, newCount, (err, row) => {
        if (!err) {
          console.log(row);
          resolve(designId);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // 디자인 생성한 유저 count 정보 업데이트
  const updateUserCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user_counter SET total_design = total_design + 1 WHERE user_id = ${userId}`, (err, row) => {
        if (!err) {
          console.log(row);
          resolve(designId);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  };

  // card_counter 생성
  const createCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO card_counter SET ?", { card_id: id }, (err, rows) => {
        if (!err) {
          console.log(rows);
          resolve(id);
        } else {
          console.error("MySQL Error:", err);
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
      return createBoardDB({
        user_id: userId,
        design_id: designId,
        order: 0,
        title: req.body.title
      });
    })
    .then((boardId) => {
      if (req.body.is_project) return;
      return createCardDB({
        design_id: designId,
        board_id: boardId,
        user_id: userId,
        title: req.body.title,
        content: req.body.explanation,
        order: 0
      });
    })
    .then((cardId) => {
      if (req.body.is_project) return;
      return createCount(cardId);
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
      return updateCardDB({ userId, cardId, data: {is_source} });
    })
    .then(() => {
      if (req.body.is_project) return;
      insertSource({ uid: userId, card_id: cardId, tabel: "design_images", files: req.files["design_file[]"] });
    })
    .then((data) => {
      if (req.body.is_project) return;
      let is_images = 0;
      if (data !== null) is_images = 1;
      return updateCardDB({ userId, cardId, data: {is_images} });
    })
    .then(insertDesignCount)
    .then(updateDesignCount)
    .then(updateUserCount)
    .then(respond)
    .catch(next);
}
