const express = require('express')
const router = express.Router()
const connection = require('../../configs/connection.js')
const { getNotification } = require('./notice')
const { v4: uuidv4 } = require('uuid')

router.get("/notice", getNotification);

router.post("/version", (req, res, next) => {
	const create = () => new Promise((resolve, reject) => {
	  const sql = "INSERT INTO opendesign.version(code) VALUES (?);";
		const code_number = uuidv4();
		connection.query(sql, [code_number], (err, row) => {
			if(err) {
				console.error(err)
				resolve(err)
			} else { 
				resolve(row)
			}
		})
	})
	create()
		.then(r => res.status(200).json({success: true,  detail: r}))
		.catch(e=> res.status(500).json({success: false, detail: e}))
});

router.get("/version", (req, res, next) => {
	const getLatestVersion = () => 
		new Promise((resolve, reject) => {
			const sql = "SELECT code FROM opendesign.version ORDER BY create_time DESC LIMIT 1";	
			connection.query(sql, (err, row) => {
				if(err){
					console.error(err)
					reject(err)
				} else {
					resolve(row[0])
				}
			})
		})
	
	getLastestVersion()
		.then(vers => res.status(200).json({success:true, version: vers}))
		.catch(err => res.status(500).json({success:false, detail: err }));
});

module.exports = router

