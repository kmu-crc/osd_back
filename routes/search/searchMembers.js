const connection = require("../../configs/connection");

const searchMembers = (req, res) => {
  console.log(req.decoded.uid)
  const searcDB = (data) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT email, uid, nick_name FROM user WHERE email regexp '${data.key}' OR nick_name regexp '${data.key}' AND uid NOT IN (${req.decoded.uid})`, (err, rows) => {
        if (!err) {
          console.log(rows);
          resolve(rows);
        } else {
          const errorMessage = "검색에 실패하였습니다.";
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
    res.status(500).json({
      success: false,
      error: err
    });
  };

  searcDB(req.body)
    .then(respond)
    .catch(error);
};

module.exports = searchMembers;
