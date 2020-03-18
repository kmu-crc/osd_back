var connection = require("../../configs/connection");
const fs = require("fs");
const { createCardDB, } = require("./itemCard");
const { createThumbnails } = require("../../middlewares/createThumbnails");
// const { insertSource } = require("../../middlewares/insertSource");
const {/* S3SourcesDetele, */ S3Upload } = require("../../middlewares/S3Sources");

exports.itemDetail = (req, res, next) => {
  // console.log("item-detail");
  const itemId = req.params.id;
  if (req.decoded !== null) {
    loginId = req.decoded.uid;
  } else {
    loginId = null;
  }

  // get thumbnail
  function getThumbnail(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT l_img FROM market.thumbnail WHERE uid IN (SELECT thumbnail_id FROM market.item WHERE uid=${id})`, (err, result) => {
          if (!err) {
            resolve(result[0]);
          } else {
            reject(err);
          }
        }
      );
    });
  };
  // get imagelist
  function getImageList(id) {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM market.images WHERE item_id=${id}`, (err, result) => {
        if (!err) {
          resolve(result);
        } else {
          reject(err);
        }
      }
      );
    });
  }
  // get basic info
  function getBasic(id) {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM market.item WHERE uid=${id}`,
        (err, result) => {
          if (!err) {
            resolve(result[0]);
          } else {
            reject(err);
          }
        }
      );
    });
  };
  // get additional info
  function getAdditional(id) {
    return new Promise((resolve, reject) => {
      connection.query(`
      SELECT * FROM market.\`item-detail\` 
      WHERE \`item-id\`=${id}`, (err, result) => {
        if (!err) {
          resolve(result[0]);
        } else {
          reject(err);
        }
      }
      );
    });
  };
  // get score
  function getScore(id) {
    return new Promise((resolve, reject) => {
      connection.query(`
      SELECT AVG(score) AS "score" FROM market.review R
      WHERE item_id=${id}`, (err, result) => {
        if (!err) {
          resolve(result[0]["score"]);
        } else {
          reject(err);
        }
      }
      );
    })
  }
  // get review
  function getReviews(id) {
    return new Promise((resolve, reject) => {
      connection.query(`
      SELECT COUNT(*) AS 'reviews' 
      FROM market.review WHERE item_id=${id}`, (err, result) => {
        if (!err) {
          resolve(result[0]["reviews"]);
        } else {
          reject(err);
        }
      }
      );
    })
  }
  // get user name
  function getUserName(id) {
    return new Promise((resolve, reject) => {
      connection.query(`
      SELECT nick_name AS 'userName' FROM market.user WHERE uid IN 
        (SELECT user_id FROM market.item WHERE uid=${id})`, (err, rows) => {
        if (!err) {
          resolve(rows[0]);
        } else {
          reject(err);
        }
      }
      );
    })
  }
  // get user thumbnail
  function getUserThumbnail(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT m_img FROM market.thumbnail WHERE uid IN (SELECT thumbnail FROM market.user WHERE uid=${id})`
      connection.query(sql, (err, rows) => {
        if (!err) {
          resolve(rows[0] ? rows[0]["m_img"] : null);
        } else {
          reject(err);
        }
      }
      );
    })
  }
  // get member
  function getMemberList(id) {
    return new Promise((resolve, reject) => {
      connection.query(`
          SELECT U.uid, U.nick_name
            FROM market.member M
          LEFT JOIN market.user U ON U.uid = M.user_id
            WHERE item_id=${id}`, (err, rows) => {
        if (!err) {
          resolve(rows || null);
        } else {
          reject(err);
        }
      }
      );
    })

  }
  // get list and card
  function getListId(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT uid FROM market.list WHERE content_id=${id} AND type="item"`
      // console.log(sql);
      connection.query(sql, (err, rows) => {
        if (!err && rows) {
          resolve(rows[0] ? rows[0]["uid"] : null);
        } else {
          reject(err);
        }
      }
      );
    })
  }
  function getCardId(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT uid FROM market.card WHERE list_id=${id}`
      // console.log(sql);
      connection.query(sql, (err, rows) => {
        if (!err && rows) {
          resolve(rows[0] ? rows[0]["uid"] : null);
        } else {
          reject(err);
        }
      }
      );
    })
  }
  function getIsBought(id) {
    return new Promise((resolve, reject) => {
      if (id == null) resolve(false);
      const sql = `SELECT uid FROM market.payment WHERE user_id=${id} AND item_id=${itemId};`
      connection.query(sql, (err, row) => {
        if (!err && row) {
          resolve(row[0] ? true : false);
        } else {
          reject(err);
        }
      });
    });
  }
  //finish
  function respond(data) {
    res.status(200).json({ ...data, success: true });
  }
  function error(err) {
    res.status(500).json({ success: false, message: err });
  }
  // 
  let data = {};
  getBasic(itemId)
    .then(basic => {
      data = { ...basic };
      return getAdditional(itemId);
    })
    .then(additional => {
      data = { ...data, ...additional };
      return getThumbnail(itemId);
    })
    .then(thumbnail => {
      data = { ...data, thumbnail: thumbnail };
      return getImageList(itemId);
    })
    .then(imageList => {
      data = { ...data, imageList: imageList };
      return getScore(itemId);
    })
    .then(score => {
      data = { ...data, score: score };
      return getReviews(itemId);
    })
    .then(total => {
      data = { ...data, total: total };
      return getUserName(itemId);
    })
    .then(userName => {
      data = { ...data, ...userName };
      return getUserThumbnail(data.user_id);
    })
    .then(thumbnail => {
      console.log("WHO", thumbnail);
      data = { ...data, who: thumbnail };
      return getImageList(itemId);
    })
    .then(imglist => {
      data = { ...data, ...imglist };
      return getListId(itemId)
    })
    .then(listId => {
      data = { ...data, listId: listId };
      return getCardId(listId);
    })
    .then(id => {
      data = { ...data, cardId: id }
      return getIsBought(loginId);
    })
    .then(bought => {
      data = { ...data, bought: bought };
      return getMemberList(itemId);
    })
    .then(members => {
      data = { ...data, members: members };
      return data;
    })
    .then(respond)
    .catch(error);
};

exports.itemStep = (req, res, next) => {
  const itemId = req.params.id;

  // board 목록 가져오기
  function getList(id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      const sql = `SELECT * FROM market.list L WHERE L.content_id=${id} AND L.type="item" ORDER BY L.order ASC`;
      connection.query(sql, (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          for (var i = 0, l = row.length; i < l; i++) {
            arr.push(new Promise((resolve, reject) => {
              let listData = row[i];
              const sql = `
              SELECT 
                C.uid, C.user_id, U.nick_name, 
                C.list_id, C.order, 
                T.m_img AS 'thumbnail', 
                C.title, C.description, 
                C.create_time, C.update_time
              FROM market.card C
                LEFT JOIN market.user U ON U.uid = C.user_id
                LEFT JOIN market.thumbnail T ON T.uid = C.thumbnail
              WHERE list_id like ${listData.uid}`
              connection.query(sql, (err, row) => {
                if (!err && row.length === 0) {
                  listData.cards = null;
                  resolve(listData);
                } else if (!err && row.length > 0) {
                  listData.cards = row;
                  resolve(listData);
                } else {
                  reject(err);
                }
              });
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

  // respond
  function respond(data) {
    // console.log(data);
    res.status(200).json({ success: true, contents: data });
  };
  // error
  function error(err) {
    res.status(500).json({ success: false, error: err });
  };

  getList(itemId)
    .then(respond)
    .catch(error);
};

exports.itemCard = (req, res, next) => {
  const cardId = req.params.card;
  function getContents(cardId) {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT *
      FROM market.content C
      WHERE card_id=${cardId} 
      ORDER BY C.order ASC`
      connection.query(sql, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          reject(err);
        }
      }
      );
    })
  };
  const respond = data => {
    res.status(200).json({ success: true, contents: data });
  };

  getContents(cardId)
    .then(contents => {
      contents.map(item => {
        item.type = item.content_type;
      })
      return contents;
    })
    .then(respond)
    .catch(next);
};

exports.HaveInItem = (req, res, next) => {
  const id = req.params.id
  const page = req.params.page
  let sql = `
  SELECT I.uid, U.nick_name, I.thumbnail_id, I.user_id, I.title,I.category_level1, I.category_level2,
  I.create_time, I.update_time ,T.m_img FROM market.item I
  LEFT JOIN market.thumbnail T ON T.uid = I.thumbnail_id
  LEFT JOIN market.user U ON U.uid = I.user_id
  WHERE I.user_id=${id}
  LIMIT ` + (page * 10) + `, 10`;
  req.sql = sql;
  next();
}

exports.createItemCard = (req, res, next) => {
  createCardDB({ ...req.body, list_id: req.params.list_id, user_id: req.decoded.uid })
    .then(cardId => {
      console.log("newcard: ", cardId);
      res.status(200).json({ success: true, card: cardId, message: "아이템 카드를 생성하였습니다." })
    })
    .catch(error => res.status(200).json({ success: false, message: error }));
}
// exports.updateItemCard = (req, res, next) => {}
exports.updateCardSource = async (req, res, next) => {
  const cardId = req.params.card_id;
  const userId = req.decoded.uid;
  const spawn = require('child_process').spawn

  const convertToMP4 = (encoded_filename, ext) => {
    return new Promise((resolve, reject) => {
      const new_file_name = encoded_filename.replace(ext, "_.mp4")
      const args = ['-y', '-i', `${encoded_filename}`, '-strict', '-2', '-c:a', 'aac', '-c:v', 'libx264', '-f', 'mp4', `${new_file_name}`]
      var proc = spawn('ffmpeg', args)
      console.log('Spawning ffmpeg ' + args.join(' '))
      proc.on('exit', code => {
        if (code === 0) {
          console.log('successful!')
          fs.unlink(encoded_filename, err => { if (err) console.log(err) })
          resolve(new_file_name)
        }
        else {
          console.log("why come here?ahm")
          reject(false)
        }
      })
    })
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
            try {
              const ext = data.substring(data.lastIndexOf("."), data.length)
              item.file_name = item.file_name.replace(ext, ".mp4")
              item.extension = "mp4"
              let new_file_name = await convertToMP4(data, ext).catch((err) => { console.log("err", err) })
              item.content = await S3Upload(new_file_name, item.file_name)
            } catch (e) {
              console.log('convert error:' + e)
            }
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
          `DELETE FROM market.content WHERE uid = ${item.uid}`,
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
        console.log("!!!!!!!!!!!!", item);
        let obj = {
          file_name: item.file_name,
          content: item.content,
          card_id: cardId,
          user_id: userId,
          content_type: item.type,
          extension: item.extension,
          order: item.order,
          data_type: item.data_type,
          private: item.private,
        };
        await connection.query(
          "INSERT INTO market.content SET ?",
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
        content_type: item.type,
        extension: item.extension,
        order: item.order,
        data_type: item.data_type,
        private: item.private,
      };
      await connection.query(
        `UPDATE market.content SET ? WHERE uid = ${item.uid}`,
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

  const respond = () => {
    res.status(200).json({ success: true, message: "저장되었습니다." });
  };
  const error = err => {
    res.status(500).json({ success: false, message: err, });
  };

  deleteDB(req.body.data.deleteContent)
    .then(() => updateDB(req.body.data.updateContent))
    .then(() => upLoadFile(req.body.data.newContent))
    .then(insertDB)
    .then(respond)
    .catch(error)
};

const updateCardFn = req => {
  // console.log("fn", req);
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE market.card SET update_time = NOW(), ? WHERE uid = ${req.cardId} AND user_id=${req.userId}`, req.data,
      (err, rows) => {
        if (!err) {
          if (rows.affectedRows) {
            resolve(rows);
          } else {
            console.log(err);
            const _err = "작성자 본인이 아닙니다.";
            reject(_err);
          }
        } else {
          console.log(err);
          reject(err);
        }
      }
    );
  });
};

exports.updateCardInfo = async (req, res, next) => {
  const cardId = req.params.card_id;
  const userId = req.decoded.uid;
  const file = req.file;

  updateCardFn({ userId, cardId, data: { title: req.body.title, description: req.body.description } })
    .then(async () => {
      const id = await createThumbnails(file);
      return id;
    })
    .then(thumbnail => {
      thumbnail && updateCardFn({ userId, cardId, data: { thumbnail: thumbnail } });
    })
    .then(
      // res.status(200).json({ success: true }))
      // .catch(
      // err => res.status(500).json({ success: false, message: err }));
      next)
    .catch(next);
};

// exports.updateCardAllData = async (req, res, next) => {
//   const cardId = req.params.card_id
//   const userId = req.decoded.uid
//   const WriteFile = (file, filename) => {
//     console.log("1");
//     let originname = filename.split(".");
//     console.log("2");
//     let name = new Date().valueOf() + "." + originname[originname.length - 1];
//     console.log("3");
//     return new Promise((resolve, reject) => {
//       console.log("4", `uploads/${name}`);
//       fs.writeFile(`uploads/${name}`, file, { encoding: "base64" }, err => {
//         console.log("5");
//         if (err) {
//           console.log("WRITE FILE:", err);
//           reject(err);
//         } else {
//           resolve(`uploads/${name}`);
//         }
//       });
//     });
//   };
//   const upLoadFile = async (userId, res) => {
//     return new Promise(async (resolve, reject) => {
//       if (!res) resolve(null);
//       try {
//         console.log("1");
//         let fileStr = res.img.split("base64,")[1];
//         console.log("2", res.file_name);
//         let data = await WriteFile(fileStr, res.file_name);
//         console.log("3", data);
//         let thumbnail = await createThumbnails({
//           image: data,
//           filename: data.split("/")[1],
//           uid: userId
//         });
//         console.log("22222", thumbnail);
//         resolve(thumbnail);
//       } catch (err) {
//         reject(err);
//       }
//     });
//   };
//   updateCardFn({ userId, cardId, data: { title: req.body.title } })
//     .then(() =>
//       updateCardFn({ userId, cardId, data: { description: req.body.description } }))
//     .then(() =>
//       upLoadFile(userId, req.body.thumbnail))
//     .then(thumbnail => {
//       if (thumbnail) {
//         updateCardFn({ userId, cardId, data: { first_img: thumbnail } })
//       } else {
//         return Promise.resolve(true)
//       }
//     })
//     .then(() => {
//       req.body = req.body.data
//       return next()
//     }).catch(next)
//   // console.log("updateCardAllData", req.body.data.newContent);
// };











// // 디자인 기본 정보 가져오기
// function getDesignInfo(id) {
//   const p = new Promise((resolve, reject) => {
//     connection.query("SELECT * FROM design WHERE uid = ?", id, (err, row) => {
//       if (!err && row.length === 0) {
//         resolve(null);
//       } else if (!err && row.length > 0) {
//         let data = row[0];
//         resolve(data);
//       } else {
//         reject(err);
//       }
//     });
//   });
//   return p;
// }

// // 등록자 닉네임 가져오기
// function getName(data) {
//   const p = new Promise((resolve, reject) => {
//     if (data.user_id === null) {
//       data.userName = null;
//       resolve(data);
//     } else {
//       connection.query(
//         "SELECT nick_name FROM user WHERE uid = ?",
//         data.user_id,
//         (err, result) => {
//           if (!err) {
//             data.userName = result[0].nick_name;
//             resolve(data);
//           } else {
//             reject(err);
//           }
//         }
//       );
//     }
//   });
//   return p;
// }

// // 카테고리 이름 가져오기
// function getCategory(data) {
//   const p = new Promise((resolve, reject) => {
//     let cate;
//     let sql;
//     if (!data.category_level1 && !data.category_level2) {
//       data.categoryName = null;
//       resolve(data);
//     } else if (data.category_level2 && data.category_level2 !== "") {
//       cate = data.category_level2;
//       sql = "SELECT name FROM category_level2 WHERE uid = ?";
//     } else {
//       cate = data.category_level1;
//       sql = "SELECT name FROM category_level1 WHERE uid = ?";
//     }
//     connection.query(sql, cate, (err, result) => {
//       if (!err) {
//         data.categoryName = result[0].name;
//         resolve(data);
//       } else {
//         reject(err);
//       }
//     });
//   });
//   return p;
// }

// // 디자인 썸네일 가져오기 (GET)
// function getThumnbail(data) {
//   const p = new Promise((resolve, reject) => {
//     if (data.thumbnail === null) {
//       data.img = null;
//       resolve(data);
//     } else {
//       const sql = `SELECT s_img, m_img, l_img FROM thumbnail WHERE uid = ${data.thumbnail}`;
//       connection.query(sql, (err, row) => {
//         if (!err && row.length === 0) {
//           data.img = null;
//           resolve(data);
//         } else if (!err && row.length > 0) {
//           data.img = [row[0]];
//           resolve(data);
//         } else {
//           reject(err);
//         }
//       });
//     }
//   });
//   return p;
// }

// // 속한 멤버들의 id, 닉네임 리스트 가져오기
// function getMemberList(data) {
//   const p = new Promise((resolve, reject) => {
//     connection.query(
//       "SELECT D.user_id, U.nick_name FROM design_member D JOIN user U ON U.uid = D.user_id WHERE D.design_id = ? AND D.is_join = 1",
//       data.uid,
//       (err, row) => {
//         if (!err && row.length === 0) {
//           data.member = null;
//           resolve(data);
//         } else if (!err && row.length > 0) {
//           data.member = row;
//           resolve(data);
//         } else {
//           reject(err);
//         }
//       }
//     );
//   });
//   return p;
// }

// // 파생된 디자인 수 가져오기
// function getChildrenCount(data) {
//   const p = new Promise((resolve, reject) => {
//     connection.query(
//       "SELECT count(*) FROM design WHERE parent_design = ?",
//       data.uid,
//       (err, result) => {
//         if (!err) {
//           data.children_count = result[0];
//           //console.log(data);
//           resolve(data);
//         } else {
//           reject(err);
//         }
//       }
//     );
//   });
//   return p;
// }

// // 내가 디자인 멤버인지 검증하기
// function isTeam(data) {
//   const p = new Promise((resolve, reject) => {
//     if (loginId === null) {
//       data.is_team = 0;
//       resolve(data);
//     } else {
//       connection.query(
//         `SELECT * FROM design_member WHERE design_id = ${
//         data.uid
//         } AND user_id = ${loginId} AND is_join = 1`,
//         (err, result) => {
//           if (!err && result.length === 0) {
//             data.is_team = 0;
//             resolve(data);
//           } else if (!err && result.length > 0) {
//             data.is_team = 1;
//             resolve(data);
//           } else {
//             //console.log(err);
//             reject(err);
//           }
//         }
//       );
//     }
//   });
//   return p;
// }

// // 내가 가입 신청중인 디자인인지 검증하기
// function waiting(data) {
//   const p = new Promise((resolve, reject) => {
//     if (loginId === null) {
//       data.waitingStatus = 0;
//       resolve(data);
//     } else {
//       connection.query(
//         `SELECT * FROM design_member WHERE design_id = ${
//         data.uid
//         } AND user_id = ${loginId} AND is_join = 0`,
//         (err, result) => {
//           if (!err && result.length === 0) {
//             data.waitingStatus = 0;
//             resolve(data);
//           } else if (!err && result.length > 0) {
//             data.waitingStatus = 1;
//             resolve(data);
//           } else {
//             //console.log(err);
//             reject(err);
//           }
//         }
//       );
//     }
//   });
//   return p;
// }

// // 맴버 섬네일 가져오기
// const getThumbnailId = id => {
//   return new Promise((resolve, reject) => {
//     connection.query(
//       `SELECT thumbnail FROM user WHERE uid = ${id}`,
//       (err, result) => {
//         if (!err) {
//           //console.log("member: ", result[0]);
//           resolve(result[0].thumbnail);
//         } else {
//           reject(err);
//         }
//       }
//     );
//   });
// };


// const memberLoop = list => {
//   return new Promise(async (resolve, reject) => {
//     let newList = [];
//     if (!list || list.length === 0) {
//       resolve(null);
//     } else {
//       for (let item of list) {
//         try {
//           let thumbnail = await getThumbnailId(item.user_id);
//           if (thumbnail) {
//             item.thumbnail = await getThumbnail(thumbnail);
//           } else {
//             item.thumbnail = null;
//           }
//           newList.push(item);
//         } catch (err) {
//           newList.push(err);
//         }
//       }
//       Promise.all(newList)
//         .then(data => {
//           //console.log("members", data);
//           return resolve(data);
//         })
//         .catch(err => reject(err));
//     }
//   });
// };

// // 맴버 가져오기
// const getMembers = (data, designId) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       data.member = await memberLoop(data.member);
//       //console.log("dddddata", data);
//       resolve(data);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// // GET PRICE OF DESIGN
// const getPrice = (data) => {
//   return new Promise((resolve, reject) => {
//     const _sql = `SELECT price FROM opendesign.price WHERE item_id = ${data.uid};`;
//     connection.query(_sql, (err, row) => {
//       if (!err) {
//         if (row.length) {
//           data.price = row[0].price;
//         }
//         resolve(data);
//       } else {
//         reject(err);
//       }
//     });
//   });
// };

// // GET REVIEWS OF DESIGN
// const getReview = (data) => {
//   return new Promise((resolve, reject) => {
//     const _sql = `
// SELECT T.m_img AS 'img', UT.m_img AS 'who', U.nick_name AS 'user_id', R.comment, R.order_id FROM opendesign.review R
// LEFT JOIN opendesign.user U ON U.uid = R.user_id
// LEFT JOIN opendesign.thumbnail T ON T.uid IN (SELECT thumbnail FROM opendesign.design WHERE uid=R.product_id)
// LEFT JOIN opendesign.thumbnail UT ON UT.uid IN (SELECT thumbnail FROM opendesign.user WHERE uid=U.uid)
// WHERE R.product_id IN (SELECT uid FROM opendesign.design WHERE user_id=${data.user_id});`;
//     // SELECT 
//     // U.nick_name AS 'user_id', R.comment, R.order_id FROM opendesign.review R
//     // LEFT JOIN opendesign.user U ON U.uid = R.user_id WHERE R.product_id=${data.user_id}`;
//     connection.query(_sql, (err, row) => {
//       if (!err) {
//         if (row.length) {
//           data.reviews = row;
//         }
//         resolve(data);
//       } else {
//         reject(err);
//       }
//     });
//   });
// };

// // GET DELIVERY OF DESIGN
// const getDelivery = (data) => {
//   return new Promise((resolve, reject) => {
//     const _sql = `
// SELECT delivery_cost AS 'cost', delivery_days AS 'days', delivery_company AS 'company' \
// FROM opendesign.product_delivery \
// WHERE product_id = ${data.uid};`;
//     connection.query(_sql, (err, row) => {
//       if (!err) {
//         if (row.length) {
//           data.delivery = row[0];
//         }
//         resolve(data);
//       } else {
//         reject(err);
//       }
//     });
//   });
// };

// getDesignInfo(designId)
//   .then(getName)
//   .then(getCategory)
//   .then(getThumnbail)
//   .then(getMemberList)
//   .then(getChildrenCount)
//   .then(isTeam)
//   .then(waiting)
//   .then(getPrice)
//   .then(getDelivery)
//   .then(getReview)
//   .then(data => getMembers(data, designId))
//   .then(data => res.status(200).json(data))
//   .catch(err => res.status(200).json(err));





