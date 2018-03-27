const connection = require("../../configs/connection");
const { isOnlySidoName } = require("../../middlewares/verifications");

const createSido = (req, res) => {
  const { name, parentId } = req.body;
  const sido = {
    name: name,
    "parent_country": parentId
  };

  const CSido = () => {
    const p = new Promise((resolve, reject) => {
      connection.query("INSERT INTO sido SET ?", sido, (err, rows) => {
        if (!err) {
          resolve(true);
        } else {
          reject(err);
        }
      });
    });
    return p;
  };

  const respond = (data) => {
    res.status(200).json({
      message: "도시 생성 성공"
    });
  };

  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  isOnlySidoName(name)
  .then(CSido)
  .then(respond)
  .catch(error);
};

module.exports = createSido;
