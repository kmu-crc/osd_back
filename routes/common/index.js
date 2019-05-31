const express = require('express')
const router = express.Router()
const { getNotification } = require('./notice')

router.get("/notice", getNotification)

module.exports = router