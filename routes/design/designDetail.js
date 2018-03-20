var connection = require("../../configs/connection");

exports.designDetail = (req, res, next) => {
  const id = req.params.id;

  // 디자인 기본 정보 가져오기
  function getDesignInfo (id) {
    const p = new Promise((resolve, reject) => {
      connection.query("SELECT * FROM design WHERE uid = ?", id, (err, row) => {
        if (!err) {
          let data = row;
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

};
