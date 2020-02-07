const connection = require("../../configs/connection");

exports.createDesignerBoardArticle = (req, res, next) => {
  let data = { ...req.body };

  const files = data["file[]"];
  const tags = data["tag"];

  delete data["file[]"];
  delete data["tag"];

  console.log("file:", files);

  const Attach = (id) => {
    return new Promise((resolve, reject) => {
      if (!files) {
        resolve(id);
      }
    });
  };
  const Tags = (id) => {
    return new Promise((resolve, reject) => {
      if (tags.length === 0) {
        resolve(id);
      };
      const tag = `#${tags.join("#")}#`;
      const sql = `UPDATE opendesign.request SET tags = ? WHERE uid=${id}`;
      connection.query(sql, tag, (err, row) => {
        if (!err) {
          resolve(id);
        } else {
          reject(err);
        }
      });
    });
  };
  const Article = () => {
    return new Promise((resolve, reject) => {
      data["private"] = data.private ? 1 : 0;
      const sql = `INSERT INTO opendesign.request SET ?`;
      connection.query(sql, data, (err, row) => {
        if (!err) {
          resolve(row.insertId);
        } else {
          console.log("ERR", err);
          reject(err);
        }
      });
    });
  };

  const respond = (id) => {
    res.status(200).json({ id: id, message: "글작성을 완료하였습니다." });
  };
  const error = () => {
    res.status(500).json({ message: "So what?" });
  };
  Article()
    .then(id => Tags(id))
    // .then(id => Attach(id))
    .then(id => respond(id))
    .catch(error);
};
