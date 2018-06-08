const connection = require("../../configs/connection");

const createBoardFn = (req) => {
  return new Promise((resolve, reject) => {
    connection.query("INSERT INTO design_board SET ?", req, (err, rows) => {
      if (!err) {
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
  console.log(req.body);
  let data = req.body;
  data.design_id = req.params.id;
  data.user_id = req.decoded.uid;

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
          connection.query(`SELECT D.uid, D.user_id, U.nick_name, D.first_img, D.title, D.order, D.update_time, C.comment_count FROM design_card D LEFT JOIN card_counter C ON D.uid = C.card_id LEFT JOIN user U ON D.user_id = U.uid WHERE board_id = ${item.uid} ORDER BY D.order ASC`, (err, rows) => {
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
      console.log(arr);
      Promise.all(arr)
        .then(() => resolve(list))
        .catch((err) => reject(err));
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

  getList(design_id)
    .then(getCardList)
    .then(respond)
    .catch(next);
};
