const connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");
const { insertSource } = require("../../middlewares/insertSource");
const { createBoardDB } = require("../design/designBoard");
const { createCard, createCardDB, updateCardDB } = require("../design/designCard");
const { joinMember, acceptLeader } = require("../design/joinMember");
const fs = require("fs");

// 2. 생성된 디자인에 썸네일 업데이트
const updateDesignFn = (req) => {
  //console.log("2번", req.designId);
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE design SET ? WHERE uid=${req.designId} AND user_id=${req.userId}`, req.data, (err, rows) => {
      if (!err) {
        if (rows.affectedRows) {
          resolve(rows);
        } else {
          //console.log("2번", err);
          throw err;
        }
      } else {
        throw err;
      }
    });
  });
};

exports.updateDesign = (req, res, next) => {
  //console.log("updateDesign");
};

// 디자인 디테일 정보 등록
exports.createDesign = async (req, res, next) => {
  //console.log("createDesign", req.files);

  const WriteFile = (file, filename) => {
    let originname = filename.split(".");
    let name = new Date().valueOf() + "." + originname[originname.length - 1];
    return new Promise((resolve, reject) => {
      fs.writeFile(`uploads/${name}`, file, { encoding: "base64" }, err => {
        if (err) {
          reject(err);
        } else {
          resolve(`uploads/${name}`);
        }
      });
    });
  };

  let file = null;
  if (req.body.files) {
    let fileStr = req.body.files[0].value.split("base64,")[1];
    let data = await WriteFile(fileStr, req.body.files[0].name);
    file = {
      image: data,
      filename: data.split("/")[1],
      uid: req.decoded.uid
    };
  };
  delete req.body.files;
  if (req.body.category_level1 === 0) {
    req.body.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    req.body.category_level2 = null;
  }

  let members = JSON.parse(req.body.member);
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
  req.body["is_project"] = 0;
  delete req.body.member;

  // 1. 디자인 생성
  const insertDesign = (data) => {
    //console.log("1번", data);
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO design SET ?", data, (err, rows) => {
        if (!err) {
          designId = rows.insertId;
          resolve();
        } else {
          //console.log("1번", err);
          reject(err);
        }
      });
    });
  };

  // 3. 디자인 count 정보 생성
  const insertDesignCount = (data) => {
    //console.log("3번", data, designId);
    return new Promise((resolve, reject) => {
      const newCount = { design_id: designId, like_count: 0, view_count: 0, card_count: 0, member_count: 1 };
      connection.query("INSERT INTO design_counter SET ? ", newCount, (err, row) => {
        if (!err) {
          resolve(designId);
        } else {
          //console.log("3", err);
          reject(err);
        }
      });
    });
  };

  // 4. 디자인 생성한 유저 count 정보 업데이트
  const updateUserCount = () => {
    //console.log("4번", userId);
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user_counter SET total_design = total_design + 1 WHERE user_id = ${userId}`, (err, row) => {
        if (!err) {
          //console.log(row);
          resolve(designId);
        } else {
          //console.log("4", err);
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
      return createThumbnails(file);
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
      return joinMember({decoded: req.decoded, design_id: designId, members});
    })
    .then(() => {
      return acceptLeader(designId, userId);
    })
    .then(insertDesignCount)
    .then(updateUserCount)
    .then(() => {
      //console.log("createBoard");
      return createBoardDB({
        user_id: userId,
        design_id: designId,
        order: 0,
        title: req.body.title
      });
    })
    .then((boardId) => {
      //console.log("createCard");
      return createCardDB({
        design_id: designId,
        board_id: boardId,
        user_id: userId,
        title: req.body.title,
        content: req.body.explanation,
        order: 0
      });
    })
    .then(respond)
    .catch(error);
};
