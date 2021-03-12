const connection = require("../../configs/connection");

// 
exports.checkInvited = (req, res, next) => {
  const userId = req.decoded.uid;
  const groupId = req.params.id;

  const success = (result) => {
    res.status(200).json({ success: true, result: result });
  };
  const fail = (error) => {
    res.status(200).json({ success: false, error: error });
  };

  const check = () => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT COUNT(*) AS 'count' FROM opendesign.videochat_invited WHERE design_id=${groupId*-1} AND to_user_id=${userId};`;
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err);
        } else {
          const result = row[0]['count'] > 0 ? true : false;
          resolve(result);
        }
      });
    });
  };

  check().then(success).catch(fail);
};

exports.inviteUser = (req, res, next) => {
  const fromUserId = req.decoded.uid;
  const toUserId = req.body.to_user_id;
  const groupId = req.params.id;

  const success = (result) => {
    res.status(200).json({ success: true, result: result });
  };
  const fail = (error) => {
    res.status(200).json({ success: false, error: error });
  };
  const invite = () => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO opendesign.videochat_invited(design_id, from_user_id, to_user_id) VALUES(${groupId*-1}, ${fromUserId}, ${toUserId});`;
			// console.log(sql);
      connection.query(sql, async (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row.insertedId != null) {
            // const { sendAlarm, netGetAlarm } = require("../../socket");
            // await getSocketId(receiver)
            // .then(socket =>
            // sendAlarm(socket.socketId, receiver, designId, "CommentDesignCard", fromId))
            resolve(true);
          }
          else {
            resolve(false);
          }
        }
      })
    });
  };

  invite().then(success).catch(fail);
};


// 
exports.cancelInvitedUser = (req, res, next) => {
  // const fromUserId = req.decoded.uid;
  const groupId = req.params.id;
  // const toUserId = req.params.user_id;

  const success = (result) => {
    res.status(200).json({ success: true, result: result });
  };
  const fail = (error) => {
    res.status(200).json({ success: false, error: error });
  };
  const cancel = () => {
    return new Promise((resolve, reject) => {
      const sql = `SET SQL_SAFE_UPDATES=0;DELECT FROM opendesign.videochat_invited WHERE design_id=${groupId*-1};`;
      // console.log(sql);
      connection.query(sql, (err, _) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  };

  cancel().then(success).catch(fail);
};

