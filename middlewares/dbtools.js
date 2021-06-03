const connection = require("../configs/connection")

const convert = (raw) => JSON.parse(JSON.stringify(raw))
exports.executorX = (sql, obj) => new Promise((resolve, reject) => connection.query(sql, obj, (e, r) => e ? reject(e) : resolve(convert(r)))) 
exports.executor = (sql) => new Promise((rslv, rjct) => connection.query(sql, (e, r) => e ? rjct(e) : rslv(convert(r))))

