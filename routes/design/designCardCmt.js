var connection = require("../../configs/connection");

exports.getCardComment = (req, res, next) => {
  const id = req.params.card_id;

  const getComment = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT C.uid, C.user_id, C.card_id, C.comment, C.create_time, C.update_time, U.nick_name, C.d_flag, T.s_img FROM card_comment C LEFT JOIN user U ON U.uid = C.user_id LEFT JOIN thumbnail T ON T.uid = U.thumbnail WHERE C.card_id = ?", id, (err, row) => {
        if (!err) {
          //console.log("get", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = (data) => {
    res.status(200).json({
      success: true,
      data: data
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false,
      data: null
    });
  };

  getComment(id)
    .then(success)
    .catch(fail);
};
const getSocketId = uid => {
  return new Promise((resolve, reject) => {
    console.log("uid", uid);
    connection.query(
      `SELECT socket_id FROM user WHERE uid = ${uid}`,
      (err, row) => {
        if (!err && row.length === 0) {
          resolve(null);
        } else if (!err && row.length > 0) {
          resolve({ socketId: row[0].socket_id });
        } else {
          console.log(err);
          reject(err);
        }
      }
    );
  });
};

const getDesignCardUserId = id => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM design_card WHERE uid=${id}`,
      (err, rows) => {
        if (!err) {
          resolve({receiver:rows[0].user_id, designId:rows[0].design_id});
        } else {
          const errorMessage = "댓글달기를 실패하였습니다.";
          reject(errorMessage);
        }
      }
    );
  });
};

const SendAlarm= async (fromId, contentId) => {
  const { sendAlarm, netGetAlarm} = require("../../socket");
  const {receiver, designId} = await getDesignCardUserId(contentId)
  if(fromId === receiver) return;
  // console.log(receiver, designId)
  await getSocketId(receiver)
    .then(socket =>
      sendAlarm(socket.socketId, receiver, designId, "CommentDesignCard", fromId))
    
};
exports.createCardComment = (req, res, next) => {
  req.body["user_id"] = req.decoded.uid;
  req.body["card_id"] = req.params.card_id;
  //console.log("req.body", req.body);

  const createComment = (data) => {
    return new Promise((resolve, reject) => {
	console.log("data:", data);
      connection.query("INSERT INTO card_comment SET ?", data, (err, row) => {
        if (!err) {
          //console.log("create", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const updateCardCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE card_counter SET comment_count = comment_count + 1 WHERE card_id = ?", id, (err, row) => {
        if (!err) {
          //console.log("update", row);
          SendAlarm(req.decoded.uid, req.params.card_id)
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  createComment(req.body)
    .then(() => updateCardCount(req.params.card_id))
    .then(success)
    .catch(fail);
};

exports.deleteCardComment = (req, res, next) => {
  const cardId = req.params.card_id;
  const cmtId = req.params.comment_id;

  const deleteComment = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM card_comment WHERE card_id = ${cardId} AND uid = ${cmtId}`, (err, row) => {
        if (!err) {
          //console.log("delete", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const updateCardCount = (id) => {
    return new Promise((resolve, reject) => {
      connection.query("UPDATE card_counter SET comment_count = comment_count - 1 WHERE card_id = ?", id, (err, row) => {
        if (!err) {
          //console.log("update", row);
          resolve(row);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  deleteComment(req.body)
    .then(() => updateCardCount(cardId))
    .then(success)
    .catch(fail);
};
