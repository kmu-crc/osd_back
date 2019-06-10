const connection = require("../../configs/connection");

exports.createCategoryLevel1 = (req, res) => {
  const { name } = req.body;

  const CCategoryLevel1 = (name) => {
    const p = new Promise((resolve, reject) => {
      connection.query(`INSERT INTO category_level1 (name) VALUES ('${name}')`, (err, rows) => {
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
      message: "카테고리 생성 성공"
    });
  };
  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  CCategoryLevel1(name)
  .then(respond)
  .catch(error);
};

exports.createCategoryLevel2 = (req, res) => {
  const { name, parentId } = req.body;
  const categoryLevel2 = {
    name: name,
    "parents_id": parentId
  };

  const CCategoryLevel2 = () => {
    const p = new Promise((resolve, reject) => {
      connection.query("INSERT INTO category_level2 SET ?", categoryLevel2, (err, rows) => {
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
      message: "카테고리 생성 성공"
    });
  };

  const error = (err) => {
    res.status(500).json({
      error: err
    });
  };

  CCategoryLevel2(name)
  .then(respond)
  .catch(error);
};
