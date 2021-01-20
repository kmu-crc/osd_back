const connection = require("../../configs/connection");
const axios = require("axios");

// result-request
exports.getSubmit = async (req, res, next) => {

  const get_submit = (submit_id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM opendesign.problem_submit WHERE uid=?", submit_id,
        (err,row)=>{
        if(!err) {
           console.log(row[0]);
           resolve(row[0]);
        } else {
           reject(err);
        }
      });
    });
  };

  const success = (data) => {res.status(200).json(data)};

  const error = (e) => {res.status(500).json({result:null, error:e})};

  get_submit(req.params.id)
   .then(success)
   .catch(error);
};

// All Data
exports.createSubmit = async (req, res, next) => {
  const { user_id, problem_id, language_id, code } = req.body;

      const generate_submit = (data) => {
        return new Promise((resolve, reject) => {
          connection.query(
            "INSERT INTO opendesign.problem_submit SET ?", data,
            (err, row) => {
              if (!err) {
		//date.uid = row.insertId;
                resolve(row.insertId);
              } else {
                console.log(err);
                reject(err);
              }
            });
        });
      };

      const submit = (submit_id) => {
        return new Promise( async (resolve, reject) => {
          // submit_id - 플랫폼의 제출 ID,
	  // problem_id - 문제 ID,
	  // language_id - 사용된 언어 ID,
	  // code - 채점할 코드
          try{
            const result = await axios({
              method: 'post',
              url: `http://203.246.113.171:8080/api/v1/submit/`,
              data: {
               submit_id: submit_id,
               problem_id: problem_id,
               language_id: language_id,
               code: code, 
              }
            });
            resolve(submit_id);
          } catch(e){
          console.error(e);
          reject(false);
          }
        });
      };
       
      const success = (submit_id) => {
        res.status(200).json({
          success: true, id: submit_id
        });
      };
    
      const fail = (e) => {
        res.status(500).json({
          success: false, error:e
        });
      };

      generate_submit(req.body)
      .then(submit)
      .then(success)
      .catch(fail);
};




// 
exports.updateSubmit = async (req, res, next) => {
  const id = req.params.id;
  console.log(req.body);
      const update_submit = (data) => {
        return new Promise((resolve, reject) => {
          connection.query(
            `UPDATE opendesign.problem_submit SET ? WHERE uid=${id}`, data,
            (err, row) => {
              if (!err) {
		//date.uid = row.insertId;
                resolve(data);
              } else {
                console.log(err);
                reject(err);
              }
            });
        });
      };

      //const submit = (data) => {
      //  return new Promise( async (resolve, reject) => {
      //    try{
      //      const result = await axios({
      //        method: 'post',
      //        url: `http://203.246.113.171:8080/api/v1/submit/`,
      //        data: {
      //         submit_id: submit_id,
      //         problem_id: problem_id,
      //         language_id: language_id,
      //         code: code, 
      //        }
      //      });
      //      resolve(true);
      //    } catch(e){
      //    console.error(e);
      //    reject(false);
      //    }
      //  });
      //};
       
      const success = (data) => {
        res.status(200).json({
          success: true,
          data: data,
        });
      };
    
      const fail = () => {
        res.status(500).json({
          success: false
        });
      };

      update_submit(req.body)
      //.then(submit)
      .then(success)
      .catch(fail);
};

// result-request
exports.getMySubmitList = async (req, res, next) => {
  const user_id = req.params.user_id;
  const content_id = req.params.content_id;
  
  const getMysubmitListRequest = () => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT * FROM opendesign.problem_submit WHERE user_id=${user_id} AND content_id=${content_id} ORDER BY create_date DESC LIMIT 5`,
        (err,rows)=>{
        if(!err) {
           resolve(rows);
        } else {
           reject(err);
        }
      });
    });
  };

  const success = (data) => {res.status(200).json({MySubmitList:data})};

  const error = (e) => {res.status(500).json({MySubmitList:null, error:e})};

  getMysubmitListRequest()
   .then(success)
   .catch(error);
};
