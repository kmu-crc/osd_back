var connection = require("../../configs/connection");
const { createThumbnails } = require("../../middlewares/createThumbnails");

exports.createGroup = (req, res, next) => {
  //console.log("createGroup");
  //console.log("insert", req.file);
  req.body["user_id"] = req.decoded.uid;
  let groupId = null;
console.log("createGroup::==========",req.body,req.file);
  const insertDetailDB = (data) => {
//    console.log("CREATE group::::==", data);
    return new Promise((resolve, reject) => {
//      connection.query("INSERT INTO opendesign.group SET ?", data, (err, rows) => {
connection.query(`INSERT INTO opendesign.group(user_id,title,explanation) VALUES ('${data.user_id}','${data.title}','${data.explanation}')`,(err,rows)=>{ 
      if (!err) {
          console.log("detail: ", rows);
          groupId = rows.insertId;
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const groupUpdata = (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE opendesign.group SET ? WHERE uid = ${groupId} `, {thumbnail: id}, (err, rows) => {
        if (!err) {
          //console.log("detail: ", rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const insertGroupCount = (data) => {
    return new Promise((resolve, reject) => {
      const newCount = { group_id: groupId, like: 0, design: 0, group: 0 };
      connection.query("INSERT INTO group_counter SET ? ", newCount, (err, row) => {
        if (!err) {
          resolve(groupId);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const updateUserCount = () => {
    return new Promise((resolve, reject) => {
      connection.query(`UPDATE user_counter SET total_group = total_group + 1 WHERE user_id = ${req.decoded.uid}`, (err, row) => {
        if (!err) {
          resolve(groupId);
        } else {
          //console.log(err);
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    //console.log("data", data);
    res.status(200).json({
      message: "성공적으로 등록되었습니다.",
      success: true,
      id: data
    });
  };

  insertDetailDB(req.body)
    .then(() => createThumbnails(req.file))
    .then(groupUpdata)
    .then(insertGroupCount)
    .then(updateUserCount)
    .then(respond)
    .catch(next);
};
