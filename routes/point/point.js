const connection = require("../../configs/connection");

exports.GetPoint = (req, res, next) => {
    const id = req.decoded.uid;
    function getPoint(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT U.point FROM market.user U WHERE uid=${id}`;
            connection.query(sql, (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve(rows[0] ? rows[0]["point"] : 0);
                }
            })
        })
    }
    getPoint(id)
        .then(point => res.status(200).json({ Point: point }))
        .catch(err => res.status(500).json(err));
};
exports.GetHistory = (req, res, next) => {
    const id = req.decoded.uid;
    const page = req.params.page;
    function getHistory(total, id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM market.point_history H WHERE user_id=${id} ORDER BY H.uid DESC LIMIT ${page*5},5`;
            console.log(sql);

            connection.query(sql, (err, rows) => {
                if (err)
                    reject(err);
                else {
                    resolve({ total: total, history: rows });
                }
            })
        })
    }
    function getHistoryTotal(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) AS 'total' FROM market.point_history H WHERE user_id=${id}`;
            connection.query(sql, (err, row) => {
                if (err)
                    reject(err);
                else {
                    resolve(row[0]["total"]);
                }
            })
        })
    }
    getHistoryTotal(id)
        .then(total => getHistory(total, id))
        .then(data => res.status(200).json({ History: data.history, HistoryCount: data.total }))
        .catch(err => res.status(500).json(err));
};
exports.PointUp = (req, res, next) => {
    const id = req.body.id;
    const point = req.body.point;
    const type = req.body.type;
    function up(id, point) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE market.user U SET U.point = U.point + ${point} WHERE U.uid=${id}`;
            connection.query(sql, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            })
        })
    }
    function record(id, point, type) {
        return new Promise((resolve, reject) => {
            const sql = `
            INSERT INTO 
                market.point_history(user_id, point_variation, charge_type)
                    VALUES(${id}, ${point}, "${type}")`;
            connection.query(sql, (err, row) => {
                if (err)
                    reject(err)
                else resolve(true);
            })
        })
    }
    up(id, point)
        .then(record(id, point, type))
        .then(success => res.status(200).json({ succes: success }))
        .catch(err => res.status(500).json({ error: err }));
};
