const connection = require("../../configs/connection");

const issue = [];
const ERROR = (str) => {
	console.error('ERROR] ' + str);
	issue.push(str);
};
const convert = (rawobj) => {
	return JSON.parse(JSON.stringify(rawobj));
}

exports.getSubmitStatus = (req, res, next) => {
  const group_id = req.params.id;
	

	const getDesignInGroup = design_id => {
		return new Promise((resolve, reject) => {
			const sql = "SELECT design_id FROM opendesign.group_join_design WHERE design_id LIKE ?";
			connection.query(sql, design_id, (err, row) => {
				if(err){
					reject(err);
				}else {
					resolve(convert(row));
				}
			});
		});
	}
	const getProblemContent = design_id => {
		return new Promise((resolve, reject) => {
			const sql = "SELECT * FROM opendesign.design_content WHERE design_id LIKE ?";
			connection.query(sql, design_id, (err, row) => {
				if(err){
					reject(err);
				} else {
					resolve(convert(row));
				}
			});
		});
	}

		getDesignInGroup(group_id)
			.then(list => {
				list.map(async element => {
					element.content = await getProblemContent(element.design_id);	
					return element;
				});
				return data;
			})
		.then(rst => { 
			res.status(200).json({ data: rst }) })
		.catch(er => { 
			res.status(200).json({ error: issue.length > 0 ? issue: er }) });
};

/*
 const getDesignInGroup = (id) => {
		return new Promise((resolve, reject)=>{
			const sql = "SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id LIKE ? AND is_join LIKE 1";
			connection.query(sql, id, (err, rows) => {
				if(err) {
				  ERROR('getdesigningroup - '+err);
					reject(err);
				}
				resolve(JSON.parse(JSON.stringify(rows)));
			});
		});
	}
	
	const getDesignBoard = (designs) => {
		return new Promise((resolve, reject) => {
			Promise.all(
			designs.map(design => {
				return new Promise((_resolve, _reject) => {
					const sql = "SELECT * FROM opendesign.design_board WHERE design_id LIKE ?";
					connection.query(sql, design.design_id, (err, rows) => {
						if(err) {
						  ERROR(err);
							_reject(err);
						} else {
							_resolve(JSON.parse(JSON.stringify(rows)));
						}
					});
				});
			}))
			.then(rst=>{resolve(rst);}).catch(reject);
		});
	};
	const getDesignCard = (board) => {
		return new Promise((resolve, reject) => {
			Promise.all(board.map(a_board => {
				return new Promise((_resolve, _reject) => {
				  const sql = "SELECT * FROM opendesign.design_card WHERE design_id LIKE ?";
					connection.query(sql, a_board.design_id, (err, rows) => {
						if(err) {
							ERROR(err);
							_reject(err);
						} else {
							_resolve(JSON.parse(JSON.stringify(rows)));
						}
					});
					})
		}))
		.then(rst => { resolve(rst) })
		.catch(e => { ERROR(e); reject(e); });
		});
	};

	getDesignInGroup(group_id)
		.then(getDesignBoard)
		.then(getDesignCard)
		.then(result => {
			res.status(200).json({ data: result });
		})
		.catch(err => {
			res.status(200).json({ error: issue.length > 0 ? issue: err });
		});

*/
