const connection = require("../../configs/connection");

exports.getCategoryLevel1 = (req, res, err) => {
  const getCategort = (userId) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM category_level1", (err, rows) => {
        if (!err) {
          console.log(rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      category: data
    });
  };
  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  getCategort()
  .then(respond)
  .catch(error);
};

exports.getCategoryLevel2 = (req, res, err) => {
  const parentsId = req.params.id;
  const getCategort = (userId) => {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM category_level2 WHERE parents_id = ${parentsId}`, (err, rows) => {
        if (!err) {
          console.log(rows);
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    res.status(200).json({
      success: true,
      category: data
    });
  };
  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  getCategort()
  .then(respond)
  .catch(error);
};
