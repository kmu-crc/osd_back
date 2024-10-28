const connection = require("../../configs/connection");
const axios = require("axios");
const grade_server = "3.37.39.154"

// result-request
exports.getSubmit = async (req, res, next) => {

  const get_submit = (submit_id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM opendesign.problem_submit WHERE uid=?", submit_id,
        (err,row)=>{
        if(!err) {
          //  console.log(row[0]);
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

// result-request
exports.getSubmit2 = async (req, res, next) => {

  const get_submit = (submit_id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        "SELECT * FROM opendesign.problem_submit WHERE uid=?", submit_id,
        (err,row)=>{
        if(!err) {
          //  console.log(row[0]);
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
  // const { user_id, problem_id, language_id, code, file_name } = req.body;
  const { user_id, language_id, answer, problem_id, content_id} = req.body;
	// console.log(answer);

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

      const update_problem_content = (id) => {
      	return new Promise((resolve, reject) => {
      	  const sql_select = `SELECT content FROM opendesign.design_content WHERE uid LIKE ${id};`;
      	    connection.query(sql_select, (err, row) => {
      	      if(!err) {
                // console.log(JSON.parse(JSON.stringify(row[0])));
                let obj = JSON.parse(JSON.stringify(row[0]));
                obj.answer = answer;
      	        // console.log(row[0]);
                const sql_update = `UPDATE opendesign.design_content SET content='${JSON.stringify(obj)}' WHERE uid LIKE ${content_id};`;
                // console.log(sql_update);
      	     	connection.query(sql_update , (er, row) => {
                  if(!er) {
                    //
                    resolve(id);
                  }
                  else { 
                    reject(er);
                  }
                });
      	      } else {
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
	const file_name = [];
	const code = [];
	Object.values(JSON.parse(answer))
		.forEach(obj => {
			file_name.push(obj.file_name);
			code.push(obj.code);
		});
        try{
	const result = await axios({
		method: 'post',
		url: `http://${grade_server}:8080/api/v1/submit/`,
		data: {
			submit_id: submit_id,
			problem_id: problem_id,
			language_id: language_id,
			file_name: file_name,
			code: code, 
		}});
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
      // .then(update_problem_content)
      .then(success)
      .catch(fail);
};
exports.updateSubmit = async (req, res, next) => {
  const id = req.params.id;
  // console.log(req.body);

  const update_submit = (data) => {
    return new Promise((resolve, reject) => {
		//console.log('debug ; ', data);
		if(data.message) {
			data.message = JSON.stringify(data.message);
		}
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

	//const get_card_and_design_id = () => {
	//	return new Promise((resolve, reject) => {
	//		const sql = `SELECT uid AS 'card_id', design_id FROM opendesign.design_card WHERE uid IN (SELECT card_id FROM opendesign.design_content WHERE uid IN (SELECT content_id FROM opendesign.problem_submit WHERE uid = id));`
	//		connection.query(sql, (err, row) => {
	//			if (!err) {
	//				console.log(row[0]);
	//				resolve(row[0]);
	//			} else {
	//				reject(err);
	//			}
	//		});
	//		);
	//	});
	//};

	//const updatetime_design = obj => {
	//	return new Promise((resolve, reject) => {
	//		const sql = `UPDATE opendesign.design SET update_time = NOW() WHERE uid = ${obj.design_id};`;
	//		connection.query(sql, (err, row) => {
	//			if (!err) {
	//				resolve(obj);
	//			} else {
	//				reject(err);
	//			}
	//		});
	//	});
	//};

	//const updatetime_card = obj => {
	//	return new Promise((resolve, reject) => {
	//		const sql = `UPDATE opendesign.deign_card SET update_time = NOW() WHERE uid = ${obj.card_id};`;
	//		connection.query(sql, (err, row) => {
	//			if (!err) {
	//				resolve(obj);
	//			} else {
	//				reject(err);
	//			}
	//		});
	//	});
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
	//.then(get_card_and_design_id = (
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
