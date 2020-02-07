var connection = require("../configs/connection");

exports.SendMsg = (socketId, uid, io, groupId) => {
  connection.query(`SELECT 
  M.uid, M.group_id, M.from_user_id, M.to_user_id, M.message, M.create_time, U.nick_name, T.s_img
        FROM message M
        JOIN user U ON U.uid = M.from_user_id
        LEFT JOIN thumbnail T ON T.uid = U.thumbnail
        WHERE M.group_id = ${groupId}`, (err, row) => {

  if (!err && row.length >= 0) {
    io.to(`${socketId}`).emit("getNewMsg", row, uid);
  } 
  else {
    console.log(err);
  }});
};

exports.CheckOpponentConnected = (socketId, uid,myUserId ,io)=>{
  io.to(`${socketId}`).emit("connectedCheck", myUserId);
};