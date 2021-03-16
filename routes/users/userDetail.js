const connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");
const { updateThumbnailID } = require("../../middlewares/updateThumbnailID");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isOnlyNicName } = require("../../middlewares/verifications");

// 유저 detail 등록
exports.insertDetail = (req, res) => {
  //console.log("insert", req.file);
  req.body["user_id"] = req.decoded.uid;
  if (req.body.category_level1 === 0) {
    req.body.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    req.body.category_level2 = null;
  }
  if (req.body.is_designer) {
    req.body.is_designer = 1;
  } else {
    req.body.is_designer = 0;
  }
  const userUpdata = id => {
    //console.log("id", id);
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user SET ? WHERE uid = ${req.decoded.uid} `,
        { thumbnail: id },
        (err, rows) => {
          if (!err) {
            //console.log("detail: ", rows);
            resolve(rows);
          } else {
            reject(err);
          }
        }
      );
    });
  };

  const insertDetailDB = data => {
    //console.log("22", data);
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO user_detail SET ?", data, (err, rows) => {
        if (!err) {
          //console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };
  const isCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT uid FROM user_counter WHERE user_id = ${req.decoded.uid}`,
        (err, row) => {
          if (!err && row.length === 0) {
            resolve(true);
          } else if (!err && row.length > 0) {
            resolve(false);
          } else {
            reject(err);
          }
        }
      );
    });
  };
  const insertUserCount = async () => {
    return new Promise(async (resolve, reject) => {
      const newCount = {
        user_id: req.decoded.uid,
        total_like: 0,
        total_design: 0,
        total_group: 0,
        total_view: 0
      };
      let isCountInfo = await isCount(req.decoded.uid);
      if (isCountInfo) {
        connection.query("INSERT INTO user_counter SET ?", newCount, (err, row) => {
          if (!err) {
            resolve(row);
          } else {
            //console.log(err);
            reject(err);
          }
        });
      } else {
        resolve(true);
      }
    });
  };

  const respond = data => {
    res.status(200).json({
      message: "성공적으로 등록되었습니다.",
      success: true
    });
  };

  const error = err => {
    res.status(500).json({
      error: err,
      success: false
    });
  };

  createThumbnails(req.file)
    .then(userUpdata)
    .then(() => insertDetailDB(req.body))
    .then(insertUserCount)
    .then(respond)
    .catch(error);
};

// 유저 정보 수정
exports.modifyDetail = (req, res) => {
  const userId = req.decoded.uid;

  // user 테이블에 들어가야 할 정보
  let userInfo = {
    password: req.body.password || null,
    nick_name: req.body.nick_name,
    update_time: new Date()
  };

  // user detail 테이블에 들어가야 할 정보
  const detailInfo = {
    about_me: req.body.about_me,
    category_level1: req.body.category_level1,
    category_level2: req.body.category_level2,
    is_designer: req.body.is_designer
  };
  //console.log(req.body);

  if (req.body.category_level1 === 0) {
    detailInfo.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    detailInfo.category_level2 = null;
  }
  if (req.body.is_designer === 1 || req.body.is_designer === true) {
    detailInfo.is_designer = 1;
  } else {
    detailInfo.is_designer = 0;
  }

  const updateDetailDB = data => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user_detail SET ? WHERE user_id=${userId}`,
        data,
        (err, rows) => {
          if (!err) {
            if (rows.affectedRows) {
              resolve(rows);
            } else {
              //console.log(err);
              reject(err);
            }
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
  };

  function createHashPw(userInfo) {
    const p = new Promise((resolve, reject) => {
      if (userInfo.password === null)
        resolve(userInfo)
      bcrypt.hash(userInfo.password, 10, function (err, hash) {
        if (!err) {
          userInfo.password = hash;
          resolve(userInfo);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
    return p;
  }

  const userUpdata = id => {
    let info = userInfo;
    if (id !== null) {
      info.thumbnail = id;
    }
    if (info.password === null) delete info.password
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE user SET ? WHERE uid = ${req.decoded.uid}`,
        info,
        (err, rows) => {
          if (!err) {
            //console.log("detail: ", rows);
            resolve(rows);
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
  };

  const respond = data => {
    res.status(200).json({
      success: true,
      message: "성공적으로 업데이트되었습니다.",
      token: data,
    });
  };

  const error = err => {
    //console.log(err);
    res.status(500).json({
      success: false,
      error: err,
    });
  };

  isOnlyNicName(userInfo.nick_name, userId)
    .then(() => createHashPw(userInfo))
    .then(() => updateDetailDB(detailInfo))
    .then(() => {
      if (req.file == null) {
        return Promise.resolve(null);
      } else {
        return createThumbnails(req.file);
      }
    })
    .then(userUpdata)
    .then(respond)
    .catch(error);
};

// 디자이너 정보 등록
exports.insertDesignerDetail = async (req, res) => {
  // console.log("===========",req.body);

  req.body["user_id"] = req.decoded.uid;
  if (req.body.category_level1 === 0) {
    req.body.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    req.body.category_level2 = null;
  }

  const respond = data => {
    res.status(200).json({
      success: true,
      message: "성공적으로 업데이트되었습니다.",
      token: data,
    });
  };

  const error = err => {
    //console.log(err);
    res.status(500).json({
      success: false,
      error: err,
    });
  };
  const insertDesigner = (thumbnail_id) => {
    console.log("thumbnail_id", thumbnail_id);
    //저장데이터 정리
    const data = req.body;
    const dbData = {
      user_id: data.user_id,
      thumbnail_id: thumbnail_id,
      type: data.type,
      description: data.description,
      location: data.location,
      category_level1: data.category_level1,
      category_level2: data.category_level2,
      tag: data.tag,
      experience: data.experience,
    }
    console.log("insertDesigner", dbData);
    const p = new Promise((resolve, reject) => {
      connection.query("INSERT INTO market.expert SET ?", dbData, (err, rows, fields) => {
        if (!err) {
          console.log("success");

          resolve(dbData);
        } else {
          console.log("err");

          reject(err);
        }
      });
    });
    return p;
  }
  createThumbnails({ ...req.file })
    .then(insertDesigner)
    .then(updateThumbnailID)
    .then(respond)
    .catch(error);
}

// 디자이너 정보 수정
exports.modifyDesignerDetail = async (req, res) => {
  // console.log(req.body);

  req.body["user_id"] = req.decoded.uid;
  if (req.body.category_level1 === 0) {
    req.body.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    req.body.category_level2 = null;
  }

  const respond = data => {
    res.status(200).json({
      success: true,
      message: "성공적으로 업데이트되었습니다.",
      token: data,
    });
  };

  const error = err => {
    //console.log(err);
    res.status(500).json({
      success: false,
      error: err,
    });
  };
  const modifyDesigner = (thumbnail_id) => {
    const data = thumbnail_id == null ? {
      ...req.body,
    } :
      {
        ...req.body,
        thumbnail_id: thumbnail_id
      };

    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE market.expert SET ? WHERE user_id=${data.user_id} AND type="designer"`,
        data,
        (err, rows) => {
          if (!err) {
            if (rows.affectedRows) {
              resolve(data);
            } else {
              //console.log(err);
              reject(err);
            }
          } else {
            //console.log(err);
            reject(err);
          }
        }
      );
    });
  }
  createThumbnails({ ...req.file })
    .then(modifyDesigner)
    .then(updateThumbnailID)
    .then(respond)
    .catch(error);
}


// 메이커 정보 등록
exports.insertMakerDetail = async (req, res) => {

  console.log("insertMakerDetail");
  req.body["user_id"] = req.decoded.uid;
  if (req.body.category_level1 === 0) {
    req.body.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    req.body.category_level2 = null;
  }

  const respond = data => {
    console.log("respond");
    res.status(200).json({
      success: true,
      message: "성공적으로 업데이트되었습니다.",
      token: data,
    });
  };

  const error = err => {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err,
    });
  };
  const insertMaker = (thumbnail_id) => {

    const data = {
      ...req.body,
      thumbnail_id: thumbnail_id,
    };
    console.log("insertMaker", data);
    const p = new Promise((resolve, reject) => {
      connection.query("INSERT INTO market.expert SET ?", data, (err, rows, fields) => {
        if (!err) {
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  }
  createThumbnails({ ...req.file })
    .then(insertMaker)
    .then(updateThumbnailID)
    .then(respond)
    .catch(error);
}

// 메이커 정보 수정
exports.modifyMakerDetail = async (req, res) => {

  req.body["user_id"] = req.decoded.uid;
  if (req.body.category_level1 === 0) {
    req.body.category_level1 = null;
  }
  if (req.body.category_level2 === 0) {
    req.body.category_level2 = null;
  }

  const respond = data => {
    res.status(200).json({
      success: true,
      message: "성공적으로 업데이트되었습니다.",
      token: data,
    });
  };

  const error = err => {
    console.log(err);
    res.status(500).json({
      success: false,
      error: err,
    });
  };
  const modifyMaker = (thumbnail_id) => {
    const data = thumbnail_id == null ? {
      ...req.body,
    } :
      {
        ...req.body,
        thumbnail_id: thumbnail_id
      };
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE market.expert SET ? WHERE user_id=${data.user_id} AND type="maker"`,
        data,
        (err, rows) => {
          if (!err) {
            if (rows.affectedRows) {
              resolve(data);
            } else {
              console.log(err);
              reject(err);
            }
          } else {
            console.log(err);
            reject(err);
          }
        }
      );
    });
  }
  createThumbnails({ ...req.file })
    .then(modifyMaker)
    .then(updateThumbnailID)
    .then(respond)
    .catch(error);
}
