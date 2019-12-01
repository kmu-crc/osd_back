const connection = require("../../configs/connection");

const createBoardFn = (req) => {
  return new Promise((resolve, reject) => {
    connection.query("INSERT INTO opendesign.design_board SET ?", req, (err, rows) => {
      if (!err) {
        console.log("board:",rows.insertId);
        resolve(rows.insertId);
      } else {
        console.error("MySQL Error:", err);
        reject(err);
      }
    });
  });
};

exports.createBoardDB = (req) => {
  return createBoardFn(req);
};

exports.createBoard = (req, res, next) => {
  console.log("[0] createBoard:", req.body);
  let data = req.body;
  data.design_id = req.params.id;
  data.user_id = req.decoded.uid;
  console.log("[1] createBoard:", req.body);

  const respond = () => {
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다."
    });
  };

  createBoardFn(data)
    .then(respond)
    .catch(next);
};

exports.getBoardList = (req, res, next) => {
  const design_id = req.params.id;

  const getList = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM design_board WHERE design_id = ${id} ORDER BY design_board.order ASC`, (err, rows) => {
        if (!err) {
          resolve(rows);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const getCardList = (list) => {
    return new Promise((resolve, reject) => {
      let arr = [];
      list.map((item, index) => {
        arr.push(new Promise((resolve, reject) => {
          connection.query(`SELECT D.uid, D.user_id, U.nick_name,D.content, D.first_img, D.title, D.order, D.update_time, C.comment_count FROM design_card D LEFT JOIN card_counter C ON D.uid = C.card_id LEFT JOIN user U ON D.user_id = U.uid WHERE board_id = ${item.uid} ORDER BY D.order ASC`, (err, rows) => {
            if (!err) {
              list[index].cards = rows;
              resolve(true);
            } else {
              console.error("MySQL Error:", err);
              reject(err);
            }
          });
        }));
      });
      //console.log(arr);
      Promise.all(arr)
        .then(() => resolve(list))
        .catch((err) => reject(err));
    });
  };

  const getThumbnail = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM thumbnail WHERE uid = ${id}`, (err, rows) => {
        if (!err) {
          //console.log(rows);
          resolve(rows[0]);
        } else {
          console.error("MySQL Error:", err);
          reject(err);
        }
      });
    });
  };

  const addThumbnail = list => {
    return new Promise(async (resolve, reject) => {
      let newArr = [];
      for (let item of list) {
        try {
          if (item.first_img) {
            item.first_img = await getThumbnail(item.first_img);
            newArr.push(item);
          } else {
            newArr.push(item);
          }
        } catch (err) {
          newArr.push(err);
        }
      }

      Promise.all(newArr).then(data => resolve(data)).catch(err => reject(err));
    });
  };

  const pickCard = list => {
    return new Promise(async (resolve, reject) => {
      let newArr = [];
      for (let item of list) {
        try {
          item.cards = await addThumbnail(item.cards);
          newArr.push(item);
        } catch (err) {
          newArr.push(err);
        }
      }

      Promise.all(newArr).then(data => resolve(data)).catch(err => reject(err));
    });
  };

  const respond = (data) => {
    //console.log("getBoards", data);
    res.status(200).json({
      success: true,
      message: "get board list 성공.",
      list: data
    });
  };

  getList(design_id)
    .then(getCardList)
    .then(pickCard)
    .then(respond)
    .catch(next);
};

// update
exports.updateBoard = (req, res, next) => {
  const board_id = req.params.board_id;

  const update = (obj) => {
    //console.log("obj: ---------", obj);
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.design_board SET ? , update_time = now() WHERE uid = ${obj.board_id}`, obj.data, (err, rows) => {
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
    //console.log(data);
    res.status(200).json({
      success: true,
      message: "update board가 성공적으로 등록되었습니다.",
      list: data
    });
  };

  update({ board_id, data: req.body })
    .then(respond)
    .catch(next);
};

// update
exports.deleteBoard = (req, res, next) => {
  const board_id = req.params.board_id;
  const design_id = req.params.design_id;

  const deleteBoardDB = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM design_board WHERE uid = ${id}`, (err, rows) => {
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
      connection.query(`SELECT d.uid, d.order FROM design_board d WHERE d.design_id=${id} order by d.order asc`, (err, rows) => {
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
          connection.query(`UPDATE opendesign.design_board SET ? WHERE uid=${item.uid}`, { order: index }, (err, rows) => {
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
  }

  const respond = (data) => {
    //console.log(data);
    res.status(200).json({
      success: true,
      message: "성공적으로 등록되었습니다.",
      list: data
    });
  };

  deleteBoardDB(board_id)
    .then(() => {
      return getList(design_id);
    })
    .then(orderUpdate)
    .then(respond)
    .catch(next);
};
