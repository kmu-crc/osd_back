const connection = require("../../configs/connection");

exports.TopExpertList = (req, res, next) => {

  const sql = `
  SELECT 
    T.expert_id AS \`uid\`, T.order, T.type,E.user_id,
    E.category_level1, E.category_level2,
    U.nick_name, U.create_time, U.update_time,
    THM.m_img
  FROM 
    (SELECT expert_id, \`order\`, "designer" AS \`type\` FROM market.top_designer 
    UNION SELECT expert_id, \`order\`, "maker" AS \`type\` FROM market.top_maker) AS T
    LEFT JOIN market.expert E ON T.expert_id = E.uid
    LEFT JOIN market.user U ON U.uid = E.user_id
    LEFT JOIN market.thumbnail THM ON THM.uid = E.thumbnail_id
  ORDER BY \`order\` ASC;`;

  console.log(sql);
  req.sql = sql;
  next();
};

exports.insertTopExpert = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;
  const order = req.body.order;

  const insertTopExpert = () => {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO market.${type === "designer" ? "top_designer" : "top_maker"} VALUES ( null, ${id}, ${order}, null)`
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.error(err);
          reject(result);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  insertTopExpert()
    .then(success)
    .catch(fail);
};
exports.updateTopExpert = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;
  const order = req.body.order;
  const updateTopExpert = () => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE market.top_designer T SET T.order=${order} WHERE T.expert_id=${id};
        UPDATE market.top_maker T SET T.order=${order} WHERE T.expert_id=${id};
      `;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  updateTopExpert()
    .then(success)
    .catch(fail);
};
exports.deleteTopExpert = (req, res, next) => {
  const id = req.params.id;
  const type = req.params.type;

  const deleteTopExpert = () => {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM market.${type === "designer" ? "top_designer" : "top_maker"} WHERE expert_id = ${id}`;
      connection.query(sql, (err, row) => {
        if (!err) {
          resolve(row);
        } else {
          console.error(err);
          reject(err);
        }
      });
    });
  };

  const success = () => {
    res.status(200).json({
      success: true
    });
  };

  const fail = () => {
    res.status(500).json({
      success: false
    });
  };

  deleteTopExpert()
    .then(success)
    .catch(fail);
};
