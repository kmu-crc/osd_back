const connection = require("../../configs/connection");

const issue = [];
const ERROR = (str) => {
	console.error('ERROR] ' + str);
	issue.push(str);
};
const convert = (rawobj) => {
	return JSON.parse(JSON.stringify(rawobj));
}

exports.checkHasProgrammingDesign = (req, res, next) => {
	const group_id = req.params.id;

	const getDesignInGroup = id => {
		return new Promise((resolve, reject) => {
			const sql = `SELECT category_level3  FROM opendesign.design WHERE uid IN (SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id LIKE ${id});`;
			connection.query(sql, (err, row) => {
				if(err) {
					reject(err);
				} else {
					resolve(convert(row));
				}
			});
		});
	};
	const checkDesignCategory = list => {
		return new Promise((resolve) => {
			let has = false;
			list.forEach(design=>{
				has = (design.category_level3 ? true : false) || has;
			});
			resolve(has);
		});
	};

	getDesignInGroup(group_id)
		.then(checkDesignCategory)
		.then(has => res.status(200).json(has))
		.catch(error => res.status(200).json(error))
};

exports.getSubmitStatus = (req, res, next) => {
  const group_id = req.params.id;
	

	const getDesignInGroup = id => {
		return new Promise((resolve, reject) => {
			const sql = "SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id LIKE ?";
			connection.query(sql, id, (err, row) => {
				if(err){
					reject(err);
				}else {
				  const list = row.map(r=> r["design_id"]);
					resolve(list);
				}
			});
		});
	}
	const getProblemContent = design_id => {
		return new Promise((resolve, reject) => {
			const sql =  
			`SELECT uid AS content_id, user_id, card_id, content, \`order\` AS content_order, create_time AS content_create_time, ${design_id} AS design_id  FROM opendesign.design_content WHERE \`type\` LIKE "PROBLEM" AND card_id IN (SELECT uid FROM opendesign.design_card WHERE design_id LIKE ${design_id});`;
			connection.query(sql, (err, row) => {
				if(err){
					reject(err);
				} else {
					resolve(convert(row));
				}
			});
		});
	};
	const getProblemContentWrapper = (list) => {
		return new Promise((resolve, reject) => {
			Promise.all(
				list.map(design => {
					return new Promise(async(_resolve) => {
						const contents = await getProblemContent(design);	
						_resolve(contents);
					});
				})
			)
			.then(result => resolve(result))
			.catch(e => reject(e));
		});
	};
	const removeEmptyElement = list => {
		return new Promise((resolve) => {
			resolve(list.filter(element=>element.length > 0));	
		});
	};
	const makeOneList = list => {
		return new Promise((resolve) => {
			const newlist = [];
			list.map(design => {
				design.map(content =>{
					newlist.push(content)
					})
			});
			resolve(newlist);
		});
	};
	const getDesignNameWrapper = list => {
		return new Promise((resolve, reject) => {
		Promise.all(
				list.map(content => {
					return new Promise(async(_resolve) => {
						const title = await getDesignName(content.design_id);	
						content.design_title = title;
						_resolve(content);
					});
				})
			)
			.then(result => resolve(result))
			.catch(e => reject(e));
		});
	};
	const getDesignName = design_id => {
			return new Promise((resolve, reject) => {
				const sql = `SELECT title FROM opendesign.design WHERE uid LIKE ${design_id}`;
				connection.query(sql, (err, row) => {
					if(err) {
						reject(err);
					} else {
						resolve(row[0]["title"]);
					}
				});
			});
		};
	const getBoardNameWrapper = list => {
		return new Promise((resolve, reject) => {
			Promise.all(
				list.map(content => {
					return new Promise(async(_resolve) => {
						const board = await getBoardName(content.card_id);	
						content.board_title = board.title;
						content.board_id = board.uid;
						content.board_order = board.order;
						_resolve(content);
					});
				})
			)
			.then(result => resolve(result))
			.catch(e => reject(e));
		});
	};
	const getBoardName = card_id => {
		return new Promise((resolve, reject) => {
			const sql = `SELECT title, uid, \`order\` FROM opendesign.design_board WHERE uid IN (SELECT board_id FROM opendesign.design_card WHERE uid LIKE ${card_id});`;
			connection.query(sql, (err, row) => {
				if(err) {
					reject(err);
				} else {
					resolve(row[0]);
				}
			});
		});
	};
	const getCardInfoWrapper = list => {
		return new Promise((resolve, reject) => {
			Promise.all(
				list.map(content => {
					return new Promise(async(_resolve) => {
						const card = await getCardInfo(content.card_id);	
						content.card_order = card.order;
						content.card_title = card.title;
						_resolve(content);
					});
				})
			)
			.then(result => resolve(result))
			.catch(e => reject(e));
		});
	};
	const getCardInfo = card_id => {
		return new Promise((resolve, reject) => {
			const sql = `SELECT title, \`order\` FROM opendesign.design_card WHERE uid LIKE ${card_id};`;
			connection.query(sql, (err, row) => {
				if(err) {
					reject(err);
				} else {
					resolve(row[0]);
				}
			});
		});
	};
	const getUserInfoWrapper = list => {
		return new Promise((resolve, reject) => {
			Promise.all(
				list.map(content => {
					return new Promise(async(_resolve) => {
						const user = await getUserInfo(content.user_id);	
						content.nick_name = user.nick_name;
						_resolve(content);
					});
				})
			)
			.then(result => resolve(result))
			.catch(e => reject(e));
		});
	};
	const getUserInfo = user_id => {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM opendesign.user WHERE uid LIKE ${user_id}`;
			connection.query(sql, (err, row) => {
				if(err) {
					reject(err);
				} else {
					resolve(row[0]);
				}
			});
		});
	};
	//get submit result
	const getSubmitResultWrapper = list => {
		return new Promise((resolve, reject) => {
			Promise.all(
				list.map(content => {
					return new Promise(async(_resolve) => {
						const submit = await getSubmitResult(content.content_id);	
						content.submit = submit;
						_resolve(content);
					});
				})
			)
			.then(result => resolve(result))
			.catch(e => reject(e));
		});
	};
	const getSubmitResult = content_id => {
		return new Promise((resolve, reject) => {
			const sql = `SELECT * FROM opendesign.problem_submit WHERE content_id LIKE ${content_id} AND result LIKE 'S' ORDER BY create_date DESC LIMIT 1;`;
			connection.query(sql, (err, row) => {
				if(err) {
					reject(err);
				} else {
					resolve(row[0]);
				}
			});
		});
	};
	
	getDesignInGroup(group_id)
		.then(getProblemContentWrapper)
		.then(removeEmptyElement)
		.then(makeOneList)
		.then(getDesignNameWrapper)
		.then(getBoardNameWrapper)
		.then(getCardInfoWrapper)
		.then(getSubmitResultWrapper)
		.then(getUserInfoWrapper)
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
