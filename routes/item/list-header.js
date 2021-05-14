var connection = require("../../configs/connection");

const convert = (raw) => JSON.parse(JSON.stringify(raw));
const executor2 = (sql, ary) => new Promise((resolve, reject) => { console.log("EXECUTE:", sql, ary); return connection.query(sql, ary, (err, row) => err ? reject(err) : resolve(convert(row)))});

exports.getPurchasedHeader = (req, res, next) => {
	const { payment, item } = req.params;
	
	// get item
	// if not get copied
	const sql = "SELECT * FROM market.list_header L WHERE (L.content_id = ? AND L.type = ?);";
	
	executor2(sql, [payment, "copied"])
		.then(row => row.length === 0 ? executor2(sql, [item, "practice"]) : row)
		.then(row => row.length === 0 ? executor2(sql, [item, "item"]) : row)
		.then(data=> res.status(200).json({success:true, data: data}))
		.catch(e  => res.status(500).json({success:false, data: e}));
};
