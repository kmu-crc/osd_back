var connection = require("../../configs/connection");
const fs = require("fs");
const { createCardDB, } = require("./itemCard");
const { createThumbnails } = require("../../middlewares/createThumbnails");
// const { insertSource } = require("../../middlewares/insertSource");
const {/* S3SourcesDetele, */ S3Upload } = require("../../middlewares/S3Sources");
const { executor, executorX } = require("../../middlewares/dbtools")

exports.additionItemDetail = (req, res, next) => {


	res.status(200).json({success:true, data: res.detail})
}


exports.itemDetail = (req, res, next) => {
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
      SELECT * FROM market.item_detail
      WHERE item_id=${id}`, (err, result) => {
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
  function getMemberList(itemId,userId) {
    return new Promise((resolve, reject) => {
      connection.query(`
          SELECT U.uid, U.nick_name,T.s_img
            FROM market.member M
          LEFT JOIN market.user U ON U.uid = M.user_id
          LEFT JOIN market.thumbnail T ON T.uid=U.thumbnail
            WHERE item_id=${itemId}
            AND NOT U.uid=${userId}`, (err, rows) => {
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
      const sql = `SELECT uid FROM market.list WHERE content_id=${id} `
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
 const header = (id) => executorX("SELECT * FROM market.list_header WHERE content_id = ?",id)
 const itemStatus = (id) => executorX("SELECT status FROM market.item_status WHERE item_id = ?;", id)

  //const specific = (id, type) => {
  //  return new Promise
  //}

  //finish
  function respond(data) {
	//res.detail = data
	//next()
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
      return getMemberList(itemId,data.user_id);
    })
    .then(members => {
      data = { ...data, members: members };
      return header(itemId);
    })
    .then(headers => {
      data = { ...data, headers: headers };
	//  return itemStatus(itemId)
	//})
	//.then(itemStatus => {
	//  data = { ...data, status: itemStatus}
      return data;
    })
    .then(respond)
    .catch(error);
};

exports.getItemReivew = (req, res, next) => {
  const id = req.params.id;
  const page = req.params.page || 0;

  const getReview = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          R.item_id, R.sort_in_group, R.user_id, R.payment_id, R.comment, R.score,R.create_time, R.thumbnail,
          T.m_img, U.nick_name,I.title
        FROM market.review R
          LEFT JOIN market.item I ON I.uid = R.item_id
          LEFT JOIN market.thumbnail T ON T.uid = I.thumbnail_id
          LEFT JOIN market.user U ON U.uid = R.user_id
        WHERE R.item_id=${id}
        ORDER BY R.create_time DESC 
        LIMIT ${page * 4}, 4`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          reject(err);
        }
      })
    });
  }
  const respond = data => { res.status(200).json({ success: true, data: data }) }
  const error = err => { res.status(500).json({ success: false, data: err }) };
  getReview()
    .then(respond)
    .catch(error);
};

exports.getItemReviewTotalCount = (req, res, next) => {
  const id = req.params.id;

  const getReview = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(*) AS 'count' FROM market.review
          WHERE item_id =${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row[0] ? row[0]['count'] : 0);
        } else {
          reject(err);
        }
      })
    });
  }
  const respond = total => { res.status(200).json({ success: true, data: total }) }
  const error = err => { res.status(500).json({ success: false, data: err }) };
  getReview()
    .then(respond)
    .catch(error);
};

exports.itemStep = (req, res, next) => {
  const itemId = req.params.id;

  // board 목록 가져오기
  function getList(id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      const sql = `SELECT * FROM market.list L WHERE L.content_id=${id}  ORDER BY L.order ASC`;
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
                C.create_time, C.update_time,
                C.private
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
exports.itemStep2 = (req, res, next) => {
  const itemId = req.params.id;

  // board 목록 가져오기
  function getList(id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      const sql = `SELECT * FROM market.list L WHERE L.content_id=${id} ORDER BY L.order ASC`;
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
                C.create_time, C.update_time,
                C.private
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

exports.itemStep3 = (req, res, next) => {
  const { id : listId } = req.params;

  // board 목록 가져오기
  function getList(id) {
    const p = new Promise((resolve, reject) => {
      let arr = [];
      const sql = `SELECT * FROM market.list L WHERE L.list_header_id = ${id}  ORDER BY L.order ASC`;
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
                C.create_time, C.update_time,
                C.private
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
    res.status(200).json({ success: true, contents: data });
  };
  // error
  function error(err) {
    res.status(500).json({ success: false, error: err });
  };

  getList(listId)
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
  SELECT I.uid, U.nick_name, I.thumbnail_id, I.user_id, I.title,I.category_level1, I.category_level2, I.category_level3,
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
      res.status(200).json({ success: true, card: cardId, message: "아이템 카드를 생성하였습니다." })
    })
    .catch(error => res.status(200).json({ success: false, message: error }));
}

exports.updateCardSource = async (req, res, next) => {
  const cardId = req.params.card_id;
  const userId = req.decoded.uid;
  const spawn = require('child_process').spawn

  const convertToMP4 = (encoded_filename, ext) =>
    new Promise((resolve, reject) => {
      const new_file_name = encoded_filename.replace(ext, "_.mp4")
      const args = ['-y', '-i', `${encoded_filename}`, '-strict', '-2', '-c:a', 'aac', '-c:v', 'libx264', '-f', 'mp4', `${new_file_name}`]
      var proc = spawn('ffmpeg', args)
      proc.on('exit', code => {
        if (code === 0) {
          fs.unlink(encoded_filename, err => { if (err) console.error(err) })
          resolve(new_file_name)
        }
        else {
          reject(false)
        }
      })
    })

  const WriteFile = (file, filename) => {
    let originname = filename.split(".")
    let name = new Date().valueOf() + "." + originname[originname.length - 1]
    return new Promise((resolve, reject) => {
      fs.writeFile(`uploads/${name}`, file, { encoding: "base64" }, err => {
        if (err) {
          reject(err)
        } else {
          resolve(`uploads/${name}`)
        }
      })
    })
  }

  const upLoadFile = async content => {
    return new Promise(async (resolve, reject) => {
      let pArr = []
      if (content.length === 0) resolve([])
      for (let item of content) {
        if (item.type === "FILE" && item.fileUrl) {
          const fileStr = item.fileUrl.split("base64,")[1]
          let data = await WriteFile(fileStr, item.file_name)
          if (item.file_type === "video") {
            try {
              const ext = data.substring(data.lastIndexOf("."), data.length)
              item.file_name = item.file_name.replace(ext, ".mp4")
              item.extension = "mp4"
              let new_file_name = await convertToMP4(data, ext).catch((err) => { console.error("err", err) })
              item.content = await S3Upload(new_file_name, item.file_name)
            } catch (e) {
              console.error('convert error:' + e)
            }
          }
          else {
            item.content = await S3Upload(data, item.file_name)
          }
          item.data_type = item.file_type
          delete item.fileUrl
          pArr.push(Promise.resolve(item))
        } else {
          item.extension = item.type
          item.data_type = item.type
          item.file_name = null
          pArr.push(Promise.resolve(item))
        }
      }
      Promise.all(pArr)
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  }

  const deleteDB = async content => {
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
      Promise.all(pArr)
        .then(data => resolve(data))
        .catch(err => reject(err));
    });
  }

  const insertDB = async arr => {
    return new Promise(async (resolve, reject) => {
      let pArr = [];
      if (arr.length === 0) resolve(true);
      for (let item of arr) {
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
         connection.query(
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
    let pArr = [];
    if (arr.length === 0) return Promise.resolve(true);
    for (let item of arr) {
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
  return new Promise((resolve, reject) => {
    connection.query(
      `UPDATE market.card SET update_time = NOW(), ? WHERE uid = ${req.cardId} AND user_id=${req.userId}`, 
		req.data,
      (err, rows) => {
        if (!err) {
          if (rows.affectedRows) {
            resolve(rows)
          } else {
            console.error(err)
            const _err = "작성자 본인이 아닙니다."
            reject(_err)
          }
        } else {
          console.error(err)
          reject(err)
        }
      }
    )
  })
}

exports.updateCardInfo = async (req, res, next) => {
  const cardId = req.params.card_id;
  const userId = req.decoded.uid;
  const file = req.file;

  updateCardFn({ 
	userId, 
	cardId, 
	data: { 
		title: req.body.title, 
		description: req.body.description, 
		private:req.body.private, 
		type: req.body.type 
	 } 
	})
    .then(async () => {
      const id = await createThumbnails(file);
      return id;
    })
    .then(thumbnail => {
      thumbnail && updateCardFn({ userId, cardId, data: { thumbnail: thumbnail } });
    })
    .then(next)
    .catch(next)
}

