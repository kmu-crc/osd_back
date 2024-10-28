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
exports.updateNotice = (req, res, next) => {
    let sql = `UPDATE opendesign.notice SET ? WHERE uid=${req.body.uid}`
    delete req.body.uid
    // console.log(sql)
    // return
    const insertNotice = () => {
        return new Promise((resolve, reject) => {
            connection.query(sql, req.body, (err, row) => {
                if (!err) {
                    // console.log(row)
                    resolve(row)
                } else {
                    console.log(err)
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
exports.insertNotice = (req, res, next) => {
    const type = req.body.type
    const title = req.body.title
    const content = req.body.content
    const start_time = req.body.start_time
    const expiry_time = req.body.expiry_time

    let sql = `INSERT INTO opendesign.notice VALUES(null, '${title}', '${type}', '${content}', NOW(), '${start_time}', '${expiry_time}')`
    // console.log(sql)
    // return
    const insertNotice = () => {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, row) => {
                if (!err) {
                    // console.log(row)
                    resolve(row)
                } else {
                    console.log(err)
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
                    console.log(err)
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
