const connection = require("../../configs/connection");
const { insertSource } = require("../../middlewares/insertSource");
const { S3SourcesDetele, S3Upload } = require("../../middlewares/S3Sources");
const { createThumbnails } = require("../../middlewares/createThumbnails");
var fs = require("fs");

const createCardFn = req => {
  return new Promise((resolve, reject) => {
    //console.log("createCard", req);
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

const createCount = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      "INSERT INTO card_counter SET ?",
      { card_id: id },
      (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      }
    );
  });
};

const updateDesignCount = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      "UPDATE design_counter SET card_count = card_count + 1 WHERE design_id = ?",
      id,
      (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      }
    );
  });
};

const updateCardFn = req => {
  //console.log("fn", req);
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE design_card SET update_time = NOW(), ? WHERE uid = ${req.cardId} AND user_id=${req.userId}`, req.data,
      (err, rows) => {
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
      }
    );
  });
};

exports.createCardDB = req => {
  return createCardFn(req)
    .then(createCount)
    .then(() => updateDesignCount(req.design_id));
};

exports.updateCardDB = req => {
  return updateCardFn(req);
};

exports.createCard = (req, res, next) => {
  //console.log(req.body);
  let data = req.body;
  data.design_id = req.params.id;
  data.user_id = req.decoded.uid;
  data.board_id = req.params.boardId;

  const createCount = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        "INSERT INTO card_counter SET ?",
        { card_id: id },
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const updateDesignCount = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE design_counter SET card_count = card_count + 1 WHERE design_id = ?",
        id,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
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
  const board_id = req.params.board_id;

  //console.log("!!!!!:", design_id, board_id);

  const getList = (design_id, board_id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM design_card WHERE design_id = ${design_id} AND board_id = ${board_id} ORDER BY design_card.order ASC`,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const respond = data => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다.",
      list: data
    });
  };

  getList(design_id, board_id)
    //.then(respond)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => res.status(500).json(err));
};

exports.getCardDetail = (req, res, next) => {
  const cardId = req.params.cardId;

  const getCard = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM design_card WHERE uid = ${id}`,
        (err, rows) => {
          if (!err) {
            resolve(rows[0]);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const getImages = card => {
    if (card.is_images === 0) {
      card.images = [];
      return Promise.resolve(card);
    }
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM design_images WHERE card_id = ${card.uid}`,
        (err, rows) => {
          if (!err) {
            card.images = rows;
            resolve(card);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const getSources = card => {
    if (card.is_source === 0) {
      card.sources = [];
      return Promise.resolve(card);
    }
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM design_source_file WHERE card_id = ${card.uid}`,
        (err, rows) => {
          if (!err) {
            card.sources = rows;
            resolve(card);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const respond = data => {
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
  //console.log(req.body);
  const cardId = req.params.cardId;

  const titleUpdate = data => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE design_card SET ? WHERE uid = ${cardId}`,
        data,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const respond = data => {
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
  //console.log(req.body);
  const cardId = req.params.cardId;

  const ContentUpdate = data => {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE design_card SET ? WHERE uid = ${cardId}`,
        data,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const respond = data => {
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
  const cardId = req.params.cardId;
  const userId = req.decoded.uid;
  //console.log(cardId, userId);

  const DeleteSourceDB = data => {
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM ${data.tabel} WHERE uid = ${data.file.uid}`,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const CountImages = id => {
    //console.log("counter", id);
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT count(*) FROM design_images WHERE card_id = ${id}`,
        (err, rows) => {
          if (!err) {
            if (rows[0]["count(*)"] === 0) {
              return resolve(
                updateCardFn({ userId, cardId, data: { is_images: 0 } })
              );
            }
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const DeleteS3 = data => {
    if (!data) {
      return Promise.resolve(true);
    }
    let deletes = JSON.parse(data);
    //console.log("deletes", deletes);
    if (deletes.length === 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let arr = deletes.map(item => {
        return new Promise((resolve, reject) => {
          const file = item.link.split(
            "https://s3.ap-northeast-2.amazonaws.com/osd.uploads.com/"
          );
          S3SourcesDetele({ filename: file[1] })
            .then(() => {
              return DeleteSourceDB({ tabel: "design_images", file: item })
                .then(resolve(true))
                .catch(err => reject(err));
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

  const respond = data => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다."
    });
  };

  DeleteS3(req.body.deleteImages)
    .then(() => {
      //console.log(req.files);
      return insertSource({
        uid: userId,
        card_id: cardId,
        tabel: "design_images",
        files: req.files["design_file[]"]
      });
    })
    .then(data => {
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
  //console.log(req.body);
  const cardId = req.params.cardId;
  const userId = req.decoded.uid;

  const DeleteSourceDB = data => {
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM ${data.tabel} WHERE uid = ${data.file.uid}`,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const CountImages = id => {
    //console.log("counter", id);
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT count(*) FROM design_source_file WHERE card_id = ${id}`,
        (err, rows) => {
          if (!err) {
            if (rows[0]["count(*)"] === 0) {
              return resolve(
                updateCardFn({ userId, cardId, data: { is_source: 0 } })
              );
            }
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const DeleteS3 = data => {
    let deletes = JSON.parse(data);
    //console.log("deletes", deletes);
    if (deletes.length === 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let arr = deletes.map(item => {
        return new Promise((resolve, reject) => {
          const file = item.link.split(
            "https://s3.ap-northeast-2.amazonaws.com/osd.uploads.com/"
          );
          S3SourcesDetele({ filename: file[1] })
            .then(() => {
              return DeleteSourceDB({ tabel: "design_source_file", file: item })
                .then(resolve(true))
                .catch(err => reject(err));
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

  const respond = data => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다."
    });
  };

  DeleteS3(req.body.deleteSources)
    .then(() => {
      return insertSource({
        uid: userId,
        card_id: cardId,
        tabel: "design_source_file",
        files: req.files["source_file[]"]
      });
    })
    .then(data => {
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
      connection.query(
        `UPDATE design_counter SET card_count = card_count - 1 WHERE design_id = (SELECT design_id FROM design_card WHERE uid = ${card_id})`,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const deleteCardDB = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM design_card WHERE uid = ${id}`,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const getList = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT d.uid, d.order FROM design_card d WHERE d.board_id=${id}`,
        (err, rows) => {
          if (!err) {
            resolve(rows);
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const orderUpdate = list => {
    return new Promise((resolve, reject) => {
      let arr = [];
      list.map((item, index) => {
        arr.push(
          new Promise((resolve, reject) => {
            connection.query(
              `UPDATE design_card SET ? WHERE uid=${item.uid}`,
              { order: index },
              (err, rows) => {
                if (!err) {
                  resolve(rows);
                } else {
                  console.error("MySQL Error:", err);
                  reject(err);
                }
              }
            );
          })
        );
      });
      Promise.all(arr)
        .then(resolve(true))
        .catch(err => reject(err));
    });
  };

  const respond = data => {
    //console.log(data);
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

exports.getCardSource = (req, res, next) => {
  const cardId = req.params.card_id;

  const getSource = id => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM design_content WHERE card_id = ${id} ORDER BY design_content.order ASC`,
        (err, rows) => {
          if (!err) {
            // //console.log("rows", rows);
            if (rows.length > 0) {
              resolve(rows);
            } else {
              resolve([]);
            }
          } else {
            console.error("MySQL Error:", err);
            reject(err);
          }
        }
      );
    });
  };

  const respond = data => {
    // //console.log(data);
    res.status(200).json({
      success: true,
      list: data
    });
  };

  getSource(cardId)
    .then(respond)
    .catch(next);
};

exports.updateCardSource = async (req, res, next) => {
  const cardId = req.params.card_id;
  const userId = req.decoded.uid;
  const spawn = require('child_process').spawn

  const convertToMP4 = (encoded_filename, ext) => {
    const p = new Promise((resolve, reject) => {
      const new_file_name = encoded_filename.replace(ext, ".mp4")
      const args = ['-y','-i', `${encoded_filename}`, '-c:a', 'aac', '-c:v', 'libx264', '-f', 'mp4', `${new_file_name}`]
      var proc = spawn('ffmpeg', args)
      console.log('Spawning ffmpeg ' + args.join(' '))
      proc.on('exit', code => {
        if (code === 0) {
          console.log('successful!')
          // fs.unlink(encoded_filename)
          resolve(new_file_name)
        }
        else reject(false)
      })
    })
    return p
  }

  const WriteFile = (file, filename) => {
    let originname = filename.split(".");
    let name = new Date().valueOf() + "." + originname[originname.length - 1];
    return new Promise((resolve, reject) => {
      fs.writeFile(`uploads/${name}`, file, { encoding: "base64" }, err => {
        if (err) {
          reject(err)
        } else {
          resolve(`uploads/${name}`)
        }
      });
    });
  }

  const upLoadFile = async content => {
    return new Promise(async (resolve, reject) => {
      let pArr = [];
      if (content.length === 0) resolve([]);
      for (let item of content) {
        if (item.type === "FILE") {
          const fileStr = item.fileUrl.split("base64,")[1];
          let data = await WriteFile(fileStr, item.file_name);
          if (item.file_type === "video") {
            const ext = data.substring(data.lastIndexOf("."), data.length)
            item.file_name = item.file_name.replace(ext, ".mp4")
            item.extension = "mp4"
            let new_file_name = await convertToMP4(data, ext)
            item.content = await S3Upload(new_file_name, item.file_name)
          }
          else {
            item.content = await S3Upload(data, item.file_name)
          }
          item.data_type = item.file_type
          delete item.fileUrl
          pArr.push(Promise.resolve(item))
        } else {
          item.extension = item.type;
          item.data_type = item.type;
          item.file_name = null;
          pArr.push(Promise.resolve(item));
        }
      }
      //console.log(pArr);
      Promise.all(pArr)
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  }

  const deleteDB = async content => {
    //console.log("deleteDB");
    return new Promise(async (resolve, reject) => {
      let pArr = [];
      if (content.length === 0) resolve(true);
      for (let item of content) {
        await connection.query(
          `DELETE FROM design_content WHERE uid = ${item.uid}`,
          (err, rows) => {
            if (!err) {
              pArr.push(true);
            } else {
              console.error("MySQL Error:", err);
              pArr.push(false);
            }
          }
        );
      }
      //console.log(pArr);
      Promise.all(pArr)
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  }

  const insertDB = async arr => {
    return new Promise(async (resolve, reject) => {
      let pArr = [];
      //console.log("insertDBarr", arr);
      if (arr.length === 0) resolve(true);
      for (let item of arr) {
        let obj = {
          file_name: item.file_name,
          content: item.content,
          card_id: cardId,
          user_id: userId,
          type: item.type,
          extension: item.extension,
          order: item.order,
          data_type: item.data_type
        };
        await connection.query(
          "INSERT INTO design_content SET ?",
          obj,
          (err, rows) => {
            if (!err) {
              pArr.push(Promise.resolve(true));
            } else {
              console.error("MySQL Error:", err);
              pArr.push(Promise.reject(err));
            }
          }
        );
      }

      Promise.all(pArr)
        .then(resolve(true))
        .catch(err => reject(err));
    });
  }

  const updateDB = async arr => {
    //console.log("updatearr", arr);
    let pArr = [];
    if (arr.length === 0) return Promise.resolve(true);
    for (let item of arr) {
      //console.log("update", item);
      let obj = {
        file_name: item.file_name,
        content: item.content,
        card_id: cardId,
        user_id: userId,
        type: item.type,
        extension: item.extension,
        order: item.order,
        data_type: item.data_type
      };
      await connection.query(
        `UPDATE design_content SET ? WHERE uid = ${item.uid}`,
        obj,
        (err, rows) => {
          if (!err) {
            pArr.push(Promise.resolve(true));
          } else {
            console.error("MySQL Error:", err);
            pArr.push(Promise.reject(err));
          }
        }
      );
    }

    return Promise.all(pArr);
  }

  const respond = data => {
    // //console.log(data);
    res.status(200).json({
      success: true,
      message: "저장되었습니다."
    });
  };

  deleteDB(req.body.deleteContent)
    .then(() => updateDB(req.body.updateContent))
    .then(() => upLoadFile(req.body.newContent))
    .then(insertDB)
    .then(respond)
    .catch(next)
};

exports.updateCardAllData = async (req, res, next) => {
  const cardId = req.params.card_id
  const userId = req.decoded.uid

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

  const upLoadFile = async (userId, res) => {
    return new Promise(async (resolve, reject) => {
      if (!res) resolve(null);
      try {
        let fileStr = res.img.split("base64,")[1];
        let data = await WriteFile(fileStr, res.file_name);
        let thumbnail = await createThumbnails({
          image: data,
          filename: data.split("/")[1],
          uid: userId
        });
        //console.log("22222", thumbnail);
        resolve(thumbnail);
      } catch (err) {
        reject(err);
      }
    });
  };

  updateCardFn({ userId, cardId, data: { title: req.body.title } })
    .then(() =>
      updateCardFn({ userId, cardId, data: { content: req.body.content } }))
    .then(() =>
      upLoadFile(userId, req.body.thumbnail))
    .then(thumbnail => {
      if (thumbnail) {
        updateCardFn({ userId, cardId, data: { first_img: thumbnail } })
      } else {
        return Promise.resolve(true)
      }
    })
    .then(() => {
      req.body = req.body.data
      return next()
    }).catch(next)

  // console.log("updateCardAllData", req.body.data.newContent);
};
