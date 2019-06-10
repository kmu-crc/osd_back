const connection = require("../../configs/connection");
const { isOnlyCountryName } = require("../../middlewares/verifications");

const createCountry = (req, res) => {
  const { name } = req.body;

  const CCountry = (name) => {
    const p = new Promise((resolve, reject) => {
      connection.query(`INSERT INTO country (name) VALUES ('${name}')`, (err, rows) => {
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
      message: "국가 생성 성공"
    });
  };
  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  isOnlyCountryName(name)
  .then(CCountry)
  .then(respond)
  .catch(error);
};

module.exports = createCountry;
