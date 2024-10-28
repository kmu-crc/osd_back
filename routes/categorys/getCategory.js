const connection = require("../../configs/connection");

exports.getCategoryLevel1 = (req, res, err) => {
  const getCategort = (userId) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM category_level1", (err, rows) => {
        if (!err) {
          //console.log(rows);
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
          //console.log(rows);
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

exports.getCategoryAll = (req, res, next) => {
  let category1;
  let category2 = [];

  const getCategory1 = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM category_level1", async (err, rows) => {
        if (!err && rows.length === 0) {
          //console.log("no category");
          resolve(null);
        } else if (!err && rows.length > 0) {
          category1 = rows;
          for (let i in rows) {
            const cate2 = await getCategory2(rows[i].uid);
            category2.push(cate2);
          }
          const data = {
            category1: category1,
            category2: category2
          };
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  const getCategory2 = (cate1) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM category_level2 WHERE parents_id = ?", cate1, (err, rows) => {
        if (!err && rows.length === 0) {
          //console.log("no category2");
          resolve(null);
        } else if (!err && rows.length > 0) {
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
      data: data
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  getCategory1()
    .then(respond)
    .catch(error);
};


exports.getCategoryAll2 = (req, res, next) => {
  let category1;
  let category2 = [];
  let category3 = [];

  const getCategory1 = () => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM category_level1", async (err, rows) => {
        if (!err && rows.length === 0) {
          //console.log("no category");
          resolve(null);
        } else if (!err && rows.length > 0) {
          category1 = rows;
          for (let i in rows) {
            const cate2 = await getCategory2(rows[i].uid);
            category2.push(cate2);
          }
          for(let i in category2){
            for(let j in category2[i]){
              const cate3 = await getCategory3(category2[i][j].uid);
              category3.push(cate3);
            }
          }
          const data = {
            category1: category1,
            category2: category2,
            category3: category3,
          };
          resolve(data);
        } else {
          reject(err);
        }
      });
    });
  };

  const getCategory2 = (cate1) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM category_level2 WHERE parents_id = ?", cate1, async(err, rows) => {
        if (!err && rows.length === 0) {
          //console.log("no category2");
          resolve(null);
        } else if (!err && rows.length > 0) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };
  const getCategory3 = (cate2) => {
    return new Promise((resolve, reject) => {
      connection.query("SELECT * FROM category_level3 WHERE parents_id = ?", cate2, (err, rows) => {
        if (!err && rows.length === 0) {
          resolve(null);
        } else if (!err && rows.length > 0) {
          resolve(rows);
        } else {
          reject(err);
        }
      });
    });
  };

  const respond = (data) => {
    // console.log(data);
    res.status(200).json({
      success: true,
      data: data
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      error: err
    });
  };

  getCategory1()
    .then(respond)
    .catch(error);
};

