
const connection = require("../../configs/connection");


const checkPayUser = (req, res) => {
  let data={isPayUser:false};
  console.log(req.params.id);
  const checkPayUserRequest = (uid)=>{

    return new Promise((resolve, reject) => {
      const sql =`SELECT * FROM market.expert E WHERE E.user_id=${uid} AND E.isPayDate> date_sub(NOW(),interval 1 month)`;
      console.log(sql);
      connection.query(sql, (err, row) => {
        console.log(row);
        if (!err && row.length === 0) {
          data.isPayUser = false;
          resolve(data);
        } else if (!err && row.length > 0) {
          data.isPayUser = true;
          resolve(data);
        } else {
          console.log(err);
          reject(err);
        }
      });
    });
  }

  const respond = (data) => {
    res.status(200).json({
      success: true,
      message: "유료 회원입니다.",
      checkPayUser:data.isPayUser
    });
  };

  const error = (err) => {
    res.status(500).json({
      success: false,
      checkPayUser:data.isPayUser,
      error: err
    });
  };

  checkPayUserRequest(req.params.id)
  .then(respond)
  .catch(error);
};

module.exports = checkPayUser;
