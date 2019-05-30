const connection = require('../../configs/connection')

exports.getNoticeList = (req, res, next) => {
    let sql = `SELECT * from opendesign.notice`
    const getList = () => {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, row) => {
                if (!err) {
                    if (row.length === 0) {
                        resolve(null)
                    }
                    resolve(row)
                } else {
                    reject(err)
                }
            })
        })
    }
    const respond = (data) => {
        res.status(200).json({ success: true, list: data })
    }
    const error = () => {
        res.status(200).json({ success: false })
    }
    getList()
        .then(data => respond(data))
        .catch(err => { error; console.log(err) })
}
// updateNotice, insertNotice, deleteNotice,
exports.insertNotice = (req, res, next) => {
    const type = req.body.type
    const title = req.body.title
    const content = req.body.content
    const start = req.body.start
    const interval = req.body.interval
    let sql = `INSERT INTO opendesign.notice VALUES(null, ${type}, ${title}, ${content}, NOW(), ${start}, DATE_ADD(${start}, INTERVAL ${interval})`
    const insertNotice = () => {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row)
                } else {
                    reject(err)
                }
            })
        })
    }

    const success = () => { res.status(200).json({ success: true }) }
    const failure = () => { res.status(200).json({ success: false }) }

    insertNotice()
        .then(success)
        .catch(failure)
}
exports.deleteNotice = (req, res, next) => {
    const uid = req.params.id
    const deleteNotice = () => {
        return new Promise((resolve, reject) => {
            connection.query(`DELETE FROM opendesign.notice WHERE uid=${uid}`, (err, row) => {
                if (!err) {
                    resolve(row)
                } else {
                    console.log("notice:", err)
                    reject(err)
                }
            })
        })
    }
    const success = () => {
        res.status(200).json({ success: true })
    }
    const failure = () => {
        res.status(200).json({ success: false })
    }
    deleteNotice()
        .then(success).catch(failure)
}