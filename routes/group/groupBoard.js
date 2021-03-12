const connection = require("../../configs/connection");
const issue = [];
const ERROR = (str) => {
	console.error('ERROR] ' + str);
	issue.push(str);
};
const convert = (rawobj) => {
	return JSON.parse(JSON.stringify(rawobj));
}

// GROUP BOARD
// create
exports.createGroupBoard = (req, res, next) => {
	const id = parseInt(req.params.id, 10);
	const user_id = req.decoded.uid;
	
	const add = (obj) => {
		return new Promise((resolve, reject) => {
		  const sql = `INSERT INTO opendesign.group_board SET ?`
			connection.query(sql, obj, (err, row) => {
				if (!err) {
					resolve(true);
				} else {
					reject(err);
				}
			});
		});
	};
	
	add({user_id:user_id, group_id:id, title:req.body.title, content:req.body.content})
		.then(data => res.status(200).json({success:true, data}))
		.catch(err => res.status(200).json({success:false, err}));
};
// read
exports.getGroupBoardList = (req, res, next) => {
 	const id = req.params.id;
 	const page = req.params.page;
 
 	const getList = () => {
 		return new Promise((resolve, reject) => {
 			const sql = `SELECT GB.*, U.nick_name, T.m_img AS 'thumbnail' FROM opendesign.group_board GB LEFT JOIN opendesign.user U ON U.uid = GB.user_id LEFT JOIN opendesign.thumbnail T ON T.uid = U.thumbnail WHERE group_id=${id} ORDER BY uid DESC LIMIT ${page*5}, 5`;
 			connection.query(sql, (err, row) => {
 				if (!err) {
 					resolve(convert(row));
 				} else {
 					reject(err);
 				}
 			});
 		});
 	};
 	const getCommentCount = (data) => {
 		if(data.list && data.list.length === 0){
 			return data;
 		}
 		const getCount = (id)=> {
 			return new Promise(_resolve => {
 				const sql = `SELECT COUNT(*) AS 'comments' FROM opendesign.group_board_comment WHERE board_id=${id};`;
 				connection.query(sql, (err, row) => {
 					if(!err){
 						_resolve(row[0]['comments']);
 					} else {
 						_resolve(0);
 					}
 				});
 			});
 		};
 		return new Promise((resolve, reject)=> {
 			Promise.all(
 				data.list.map(async item => {
 					item.comments = await getCount(item.uid);
 					return item;
 				})
 			)
 			.then(list=>resolve({list:list,total:data.total}))
 			.catch(reject);
 		});
 	};
 	const getTotal = (list) => {
 		return new Promise((resolve, reject) => {
 			const sql = `SELECT COUNT(*) 'cnt' FROM opendesign.group_board WHERE group_id=${id};`;
 			connection.query(sql, (err, row) => {
 				if (!err) {
 					resolve({ list: list, total: row[0]["cnt"] });
 				} else {
 					reject(err);
 				}
 			});
 		});
 	};
 
 	getList()
 		.then(getTotal)
 		.then(getCommentCount)
 		.then(data => res.status(200).json({ success: true, data }))
 		.catch(err => res.status(200).json({ success: false, err }));
};
// update
exports.updateGroupBoard = (req, res, next) => {
 	const board_id = req.params.board_id;
 
 	const edit = (obj) => {
 		return new Promise((resolve, reject) => {
 			const sql = `UPDATE opendesign.group_board SET update_time = NOW(), ? WHERE uid=${board_id};`;
 			connection.query(sql,obj, (err, row) => {
 				if (!err) {
 					resolve(true);
 				} else {
				console.error(err);
 					reject(err);
 				}
 			});
 		});
 	};

 	edit({title: req.body.title, content: req.body.content})
 		.then(data => res.status(200).json({success:true, data}))
 		.catch(err => res.status(200).json({success:false, err}))
};
// delete
exports.removeGroupBoard = (req, res, next) => {
 	const group_id = req.params.group_id;
	const board_id = req.params.board_id;
 	const remove = () => {
 		return new Promise((resolve, reject) => {
 			const sql = `DELETE FROM opendesign.group_board WHERE uid=${board_id};`;
 			connection.query(sql, (err, row) => {
 				if (!err) {
 					resolve(true);
 				} else {
 					reject(err);
 				}
 			});
 		});
 	};
 
 	remove()
 		.then(data => res.status(200).json({success:true, data}))
 		.catch(err => res.status(200).json({success:false, err}));
};


// GROUP BOARD COMMENT
// create
exports.createGroupBoardComment = (req, res, next) => {
 	const board_id = req.params.board_id;
 	const user_id = req.decoded.uid;
 
 	const add = (obj) => {
 		return new Promise((resolve, reject) => {
 		  const sql = `INSERT INTO opendesign.group_board_comment SET ?`;
 			connection.query(sql, obj, (err, row) => {
 				if (!err) {
 					resolve(true);
 				} else {
 					reject(err);
 				}
 			});
 		});
 	};
 
 	let obj = { user_id:user_id, board_id:board_id, comment:req.body.comment,};
 	if (req.body.parent) {
 		obj.parent = req.body.parent;
 	}
 	add(obj)
 		.then(data => res.status(200).json({success:true, data}))
 		.catch(err => res.status(200).json({success:false, err}));
};
// read
exports.getGroupBoardCommentList = (req, res, next) => {
 	const id = req.params.id;
 	const board_id = req.params.board_id;
 
 	const getList = () => {
 		return new Promise((resolve, reject) => {
 			const sql = `SELECT * FROM opendesign.group_board_comment WHERE board_id=${board_id} ORDER BY parent DESC, uid DESC;`;
 			connection.query(sql, (err, row) => {
 				if (!err) {
 					resolve(convert(row));
 				} else {
 					reject(err);
 				}
 			});
 		});
 	};
 	const getUserInfoList = list => {
 		const getUserInfo = user_id => {
 			return new Promise((resolve) => {
 				const sql = `SELECT U.uid as user_id, U.nick_name, T.m_img FROM opendesign.user U LEFT JOIN opendesign.thumbnail T ON T.uid LIKE U.thumbnail WHERE U.uid LIKE ${user_id};`;
 				connection.query(sql, (err, row) => {
 					if (!err) {
 						resolve(convert(row[0]));
 					} else {
 						resolve(null);
 					}
 				});
 			});
 		};
 		return new Promise((resolve, reject) => {
 			Promise.all(list.map(comment =>
 				new Promise(async (resolve) => {
 					const info = await getUserInfo(comment.user_id);	
					comment.nick_name = info.nick_name;
					comment.s_img = info.m_img;
					comment.thumbnail = { s_img:info.m_img};
 					resolve(comment);
 				})
 			))
 			.then(resolve)
 			.catch(reject);
 		});
 	};
 
 	getList()
 		.then(getUserInfoList)
 		.then(data => res.status(200).json({success:true, data}))
 		.catch(err => res.status(200).json({success:false, err}));
};
// update
exports.updateGroupBoardComment = (req, res, next) => {
 	const id = req.params.id;
 	
 	const update = (obj) => {
 		return new Promise((resolve, reject) => {
 			const sql = `UPDATE opendesign.group_board_comment SET update_time = NOW(), ? WHERE uid=${id};`;
 			connection.query(sql, (err, row) => {
 				if (!err) {
 					resolve(true);
 				} else {
 					reject(err);
 				}
 			});
 		});
 	};
 
 	update({comment: req.body.comment})
 		.then(data => res.status(200).json({success:true, data}))
 		.catch(err => res.status(200).json({success:false, err}))
 		.then(update);
};
// delete
exports.removeGroupBoardComment = (req, res, next) => {
 	const id = req.params.comment_id;
 	const remove = () => {
 		return new Promise((resolve, reject) => {
 			const sql = `DELETE FROM opendesign.group_board_comment WHERE uid=${id};`;
			// console.log(sql);
 			connection.query(sql, (err, row) => {
 				if (!err) {
 					resolve(true);
 				} else {
				console.log(err);
 					reject(err);
 				}
 			});
 		});
 	};
 	remove()
 		.then(data => res.status(200).json({success:true, data}))
 		.catch(err => res.status(200).json({success:false, err}));
};


