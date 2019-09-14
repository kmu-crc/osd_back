const connection = require("../../configs/connection");

const searchMembers = (req, res) => {
  //console.log(req.decoded.uid);
  const designId = req.params.id;
  //console.log(designId);
  const searcDB = (data) => {
    let sql;
    if (designId && designId !== "null") {
      sql = `SELECT U.email, U.uid, U.nick_name FROM user U
      WHERE (U.email regexp '${data.key}' OR U.nick_name regexp '${data.key}')
      AND U.uid NOT IN (SELECT U.uid FROM user U WHERE U.uid = ${req.decoded.uid})
      AND NOT EXISTS (SELECT M.user_id FROM design_member M WHERE M.design_id = ${designId} AND U.uid = M.user_id)`;
    } else {sql=`SELECT U.email,U.uid,U.nick_name,thumbnail.s_img FROM opendesign.user U JOIN thumbnail ON U.thumbnail = thumbnail.uid WHERE (U.email regexp '${data.key}' OR U.nick_name regexp '${data.key}') AND U.uid NOT IN (${req.decoded.uid})`
    }
    return new Promise((resolve, reject) => {
      console.log("sql", sql);
      connection.query(sql, (err, rows) => {
        if (!err) {
          //console.log(rows);
          resolve(rows);
        } else {
          const errorMessage = "검색에 실패하였습니다.";
          //console.log(err);
          reject(errorMessage);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      members: data
    });
  };

  const error = (err) => {
    res.status(200).json({
      success: false,
      error: err
    });
  };

  searcDB(req.body)
    .then(respond)
    .catch(error);
};

module.exports = searchMembers;
