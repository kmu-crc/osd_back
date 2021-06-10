const express = require("express")
const axios = require("axios")
const router = express.Router()
const tokenDecoded = require("../../middlewares/tokenDecoded")
const getItemList = require("../../middlewares/getItemList")
const insertThumbnail = require("../../middlewares/insertThumbnail")
const auth = require("../../middlewares/auth")

const { executor, executorX } = require("../../middlewares/dbtools")


const getIssueList = async (req, res, next) => {
	const { type, page, id } = req.params

	const sql = `SELECT * FROM market.issue WHERE content_type=\"${type}\" AND content_id=${id} LIMIT 0, 10;`

	executor(sql)
		.then(detail =>  
				res.status(200).json({ success: true, detail: detail }))
		.catch(e =>
				res.status(500).json({ success: false, detail: e }))
}
const createIssue = async (req, res, next) => {
	const { type, id, data } = req.body

	const sql = `INSERT INTO market.issue SET ?`
	const obj = { content_type: type, content_id: id, detail: data }
	
	executorX(sql, obj)
		.then(r => 
				res.status(200).json({ success: true, detail: r }))
		.catch(e => 
				res.status(500).json({ success: false, detail: e }))

}

router.get("/:type/:id/list/:page", /*auth*,*/ getIssueList)
router.post("/", /*auth,*/ createIssue)
//won't make delete

module.exports = router

