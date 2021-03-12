const connection = require("../../configs/connection");

const issue = [];
const ERROR = (str) => {
	console.error('ERROR] ' + str);
	issue.push(str);
};
const convert = (rawobj) => {
	return JSON.parse(JSON.stringify(rawobj));
}

exports.getCouldJoinVChat= (req, res, next) => {
	const group_id = req.params.id;
	const user_id = req.decoded.uid;
  
	// console.log(group_id, user_id);

	const getUserCreateDesign = id => {
		return new Promise((resolve, reject) => {
			const sql = `SELECT uid FROM opendesign.design WHERE user_id=${id};`;
			connection.query(sql, (err,row) => {
				if(err){
					reject(err);
				} else {
					resolve(row.map(r=>r.uid));
				}
			});
		});
	};
	const checkDesignInThisGroup = id => {
		return new Promise((resolve) => {
			const sql = `SELECT COUNT(*) AS in_group FROM opendesign.group_join_design WHERE design_id LIKE ${id} AND parent_group_id LIKE ${group_id}`;
			connection.query(sql, (err, row) => {
				if(err) {
					resolve(false);
				} else {
					resolve(row[0].in_group > 0 ? true : false);
				}
			});
		});
	};
	const checkDesignInThisGroupWrapper = list => {
		return new Promise((resolve, reject) => {
		  let in_group = false;
			Promise.all(
				list.map(design => {
					return new Promise( async(_resolve) => {
						in_group = await checkDesignInThisGroup(design) || in_group;
						_resolve(in_group);
					});
				})
			)
			.then(()=>resolve(in_group))
			.catch(error => reject(error));
		});
	};

	getUserCreateDesign(user_id)
		.then(checkDesignInThisGroupWrapper)
		.then(in_group=> res.status(200).json(in_group))
		.catch(error => res.status(200).json(error));
};

exports.getCouldJoinVChat2 = (req, res, next) => {
	const group_id = req.params.id;
	const user_id = req.decoded.uid;
  
	const isInGroup = () => {
		return new Promise((resolve) => {
			const sql = `SELECT * FROM (SELECT uid FROM opendesign.group WHERE user_id = ${user_id} AND uid IN (SELECT group_id FROM opendesign.group_join_group WHERE parent_group_id = ${group_id}) UNION SELECT uid FROM opendesign.design WHERE user_id = ${user_id} AND uid IN (SELECT design_id FROM opendesign.group_join_design WHERE parent_group_id = ${group_id})) T;`;
			connection.query(sql, (err, row) => {
				if (!err && row.length > 0) {
					// console.log(row);
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
	};
	const orInvited = (ingroup) => {
		return new Promise((resolve) => {
			if(ingroup) resolve(ingroup);
			const sql = `SELECT * FROM opendesign.videochat_invited WHERE design_id = ${-1*group_id} AND to_user_id = ${user_id}`;
			connection.query(sql, (err, row) => {
				if (!err && row.length > 0 ) {
					// console.log(row);
					resolve(true);
				} else {
					resolve(false)
				}
			});
		});
	};

	isInGroup()
		.then(orInvited)
		.then(in_group=> res.status(200).json(in_group))
		.catch(error => res.status(200).json(error));
};

