const connection = require("../../configs/connection");
const { insertSource } = require("../../middlewares/insertSource");
const { S3SourcesDetele } = require("../../middlewares/S3Sources");

const createCardFn = (req) => {
  return new Promise((resolve, reject) => {
    console.log("createCard", req);
    connection.query("INSERT INTO design_card SET ?", req, (err, rows) => {
      if (!err) {
        resolve(rows.insertId);
      } else {
        console.error("MySQL Error:", err);
        reject(err);
      }
    });
  });
};

const updateCardFn = (req) => {
  console.log("fn", req);
  return new Promise((resolve, reject) => {
    connection.query(`UPDATE design_card SET ? WHERE uid=${req.cardId} AND user_id=${req.userId}`, req.data, (err, rows) => {
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

exports.createCardDB = (req) => {
  return createCardFn(req);
};

exports.updateCardDB = (req) => {
  return updateCardFn(req);
};

exports.createCard = (req, res, next) => {
  console.log(req.body);
  let data = req.body;
  data.design_id = req.params.id;
  data.user_id = req.decoded.uid;
  data.board_id = req.params.boardId;

  const createCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO card_counter SET ?", { card_id: id }, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const updateDesignCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE design_counter SET card_count = card_count + 1 WHERE design_id = ?", id, (err, rows) => {
        if (!err) {
          resolve(rows);
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
      message: "성공적으로 등록되었습니다."
    });
  };

  createCardFn(data)
    .then(createCount)
    .then(() => updateDesignCount(data.design_id))
    .then(respond)
    .catch(next);
};

exports.getCardList = (req, res, next) => {
  const design_id = req.params.id;
  const board_id = req.params.boardId;

  const getList = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM design_card WHERE design_id = ${id} AND board_id = ${board_id} ORDER BY design_card.order ASC`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다.",
      list: data
    });
  };

  getList(design_id)
    .then(respond)
    .catch(next);
};

exports.getCardDetail = (req, res, next) => {
  const cardId = req.params.cardId;

  const getCard = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM design_card WHERE uid = ${id}`, (err, rows) => {
        if (!err) {
          resolve(rows[0]);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const getImages = (card) => {
    if (card.is_images === 0) {
      card.images = [];
      return Promise.resolve(card);
    }
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM design_images WHERE card_id = ${card.uid}`, (err, rows) => {
        if (!err) {
          card.images = rows;
          resolve(card);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const getSources = (card) => {
    if (card.is_source === 0) {
      card.sources = [];
      return Promise.resolve(card);
    }
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM design_source_file WHERE card_id = ${card.uid}`, (err, rows) => {
        if (!err) {
          card.sources = rows;
          resolve(card);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다.",
      detail: data
    });
  };

  getCard(cardId)
    .then(getImages)
    .then(getSources)
    .then(respond)
    .catch(next);
};

exports.updateTitle = (req, res, next) => {
  console.log(req.body)
  const cardId = req.params.cardId;

  const titleUpdate = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_card SET ? WHERE uid = ${cardId}`, data, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다."
    });
  };

  titleUpdate(req.body)
    .then(respond)
    .catch(next);
};

exports.updateContent = (req, res, next) => {
  console.log(req.body)
  const cardId = req.params.cardId;

  const ContentUpdate = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_card SET ? WHERE uid = ${cardId}`, data, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다."
    });
  };

  ContentUpdate(req.body)
    .then(respond)
    .catch(next);
};

exports.updateImages = (req, res, next) => {
  console.log(req.body);
  const cardId = req.params.cardId;
  const userId = req.decoded.uid;

  const DeleteSourceDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM ${data.tabel} WHERE uid = ${data.file.uid}`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const CountImages = (id) => {
    console.log("counter", id);
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) FROM design_images WHERE card_id = ${id}`, (err, rows) => {
        if (!err) {
          if (rows[0]["count(*)"] === 0) {
            return resolve(updateCardFn({ userId, cardId, data: { is_images: 0 } }));
          }
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const DeleteS3 = (data) => {
    let deletes = JSON.parse(data);
    console.log("deletes", deletes);
    if (deletes.length === 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let arr = deletes.map(item => {
        return new Promise((resolve, reject) => {
          const file = item.link.split("https://s3.ap-northeast-2.amazonaws.com/osd.uploads.com/");
          S3SourcesDetele({ filename: file[1] })
            .then(() => {
              return DeleteSourceDB({ tabel: "design_images", file: item }).then(resolve(true)).catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
      });
      Promise.all(arr)
        .then(() => {
          resolve(CountImages(cardId));
        })
        .catch(err => reject(err));
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다."
    });
  };

  DeleteS3(req.body.deleteImages)
    .then(() => {
      return insertSource({ uid: userId, card_id: cardId, tabel: "design_images", files: req.files["design_file[]"] });
    }).then((data) => {
      let is_images = 0;
      if (data == null) {
        return Promise.resolve();
      } else {
        is_images = 1;
      }
      return updateCardFn({ cardId, userId, data: { is_images } });
    })
    .then(respond)
    .catch(next);
};

exports.updateSources = (req, res, next) => {
  console.log(req.body);
  const cardId = req.params.cardId;
  const userId = req.decoded.uid;

  const DeleteSourceDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM ${data.tabel} WHERE uid = ${data.file.uid}`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const CountImages = (id) => {
    console.log("counter", id);
    return new Promise((resolve, reject) => {
      connection.query(`SELECT count(*) FROM design_source_file WHERE card_id = ${id}`, (err, rows) => {
        if (!err) {
          if (rows[0]["count(*)"] === 0) {
            return resolve(updateCardFn({ userId, cardId, data: { is_source: 0 } }));
          }
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  }

  const DeleteS3 = (data) => {
    let deletes = JSON.parse(data);
    console.log("deletes", deletes);
    if (deletes.length === 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let arr = deletes.map(item => {
        return new Promise((resolve, reject) => {
          const file = item.link.split("https://s3.ap-northeast-2.amazonaws.com/osd.uploads.com/");
          S3SourcesDetele({ filename: file[1] })
            .then(() => {
              return DeleteSourceDB({ tabel: "design_source_file", file: item }).then(resolve(true)).catch(err => reject(err));
            })
            .catch(err => reject(err));
        });
      });
      Promise.all(arr)
        .then(() => {
          resolve(CountImages(cardId));
        })
        .catch(err => reject(err));
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다."
    });
  };

  DeleteS3(req.body.deleteSources)
    .then(() => {
      return insertSource({ uid: userId, card_id: cardId, tabel: "design_source_file", files: req.files["source_file[]"] });
    }).then((data) => {
      let is_source = 0;
      if (data == null) {
        return Promise.resolve();
      } else {
        is_source = 1;
      }
      return updateCardFn({ cardId, userId, data: { is_source } });
    })
    .then(respond)
    .catch(next);
};

exports.deleteCard = (req, res, next) => {
  const board_id = req.params.board_id;
  const card_id = req.params.card_id;

  const updateDesignCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE design_counter SET card_count = card_count - 1 WHERE design_id = (SELECT design_id FROM design_card WHERE uid = ${card_id})`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const deleteCardDB = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_card WHERE uid = ${id}`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const getList = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT d.uid, d.order FROM design_card d WHERE d.board_id=${id}`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const orderUpdate = (list) => {
    return new Promise((resolve, reject) => {
      let arr = [];
      list.map((item, index) => {
        arr.push(new Promise((resolve, reject) => {
          connection.query(`UPDATE design_card SET ? WHERE uid=${item.uid}`, {order: index}, (err, rows) => {
            if (!err) {
              resolve(rows);
            } else {
              console.error("MySQL Error:", err);
              reject(err);
            }
          });
        }))
      });
      Promise.all(arr)
        .then(resolve(true))
        .catch(err => reject(err));
    });
  };

  const respond = (data) => {
    console.log(data);
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다.",
      list: data
    });
  };

  updateDesignCount(card_id)
    .then(() => deleteCardDB(card_id))
    .then(() => {
      return getList(board_id);
    })
    .then(orderUpdate)
    .then(() => updateDesignCount())
    .then(respond)
    .catch(next);
};
