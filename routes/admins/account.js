const connection = require("../../configs/connection");

exports.AccountList = (req, _, next) => {
    const { page, max, sort, desc, start, end, keyword } = req.params;
    const keywords = (keyword === "null" || keyword == null) ? [] : keyword.trim().split(" ");

    let options = [];

    // keyword
    if (keywords.length !== 0) {
        keywords.map(word =>
            options.push(`U.nick_name LIKE "%${word}%"`))
    }
    // dates
    if (start !== "null" && end !== "null") {
        if (sort === `create`) {
            options.push(`U.create_time BETWEEN '${start}' AND '${end}'`);
        } else {
            options.push(`U.update_time BETWEEN '${start}' AND '${end}'`);
        }
    }

    const WHERE = `
        ${options.length > 0 ? "WHERE " : ""}
           ${options.length > 0 ? options.map(opt => opt).join(" AND ") : ""}`;

    // LEFT JOIN
    let sql = `
        SELECT
            *
        FROM
            market.user U
        ${WHERE}
        ORDER BY
            ${sort === "create" ? "U.create_time" : sort === "update" ? "U.update_time" : "U.nick_name"}
            ${desc === "desc" ? "DESC" : "ASC"}
        LIMIT ${max * page}, ${max};
    `;
    // console.log("account:", sql);
    req.sql = sql;
    next();
}

exports.AccountListCount = (req, res, _) => {
    const { page, max, sort, desc, start, end, keyword } = req.params;
    const keywords = (keyword === "null" || keyword == null) ? [] : keyword.trim().split(" ");
    let options = [];
    // keyword
    if (keywords.length !== 0) {
        keywords.map(word =>
            options.push(`U.nick_name LIKE "%${word}%"`))
    }
    // dates
    if (start !== "null" && end !== "null") {
        if (sort === `create`) {
            options.push(`U.create_time BETWEEN '${start}' AND '${end}'`);
        } else {
            options.push(`U.update_time BETWEEN '${start}' AND '${end}'`);
        }
    }

    const WHERE = `
        ${options.length > 0 ? "WHERE " : ""}
           ${options.length > 0 ? options.map(opt => opt).join(" AND ") : ""}`;

    // LEFT JOIN
    let sql = `
        SELECT
            COUNT(*) AS 'cnt'
        FROM
            market.user U
        ${WHERE}
        ORDER BY
            ${sort === "create" ? "U.create_time" : sort === "update" ? "U.update_time" : "U.nick_name"}
            ${desc === "desc" ? "DESC" : "ASC"}
        LIMIT ${max * page}, ${max};
    `;

    const getCount = () => {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (!err && result.length) {
                    resolve(result[0]);
                } else {
                    console.error(err);
                    reject(err);
                }
            });
        });
    }

    getCount()
        .then(num => res.status(200).json(num))
        .catch(err => res.status(500).json(err));
}

exports.DeleteAccount = (req, res, _) => {
    const id = req.params.id;

    const deleteMaker = () => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.expert WHERE user_id = ${id} AND \`type\` LIKE 'maker'`;
            connection.query(sql, (err, _) => {
                if (err) {
                    console.error("DELETE DESIGN ERROR:", err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
    const deleteDesigner = () => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.expert WHERE user_id = ${id} AND \`type\` LIKE 'designer'`;
            connection.query(sql, (err, _) => {
                if (err) {
                    console.error("DELETE DESIGN ERROR:", err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }
    const deleteAccount = () => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.user WHERE uid = ${id}`;
            connection.query(sql, (err, _) => {
                if (err) {
                    console.error("DELETE DESIGN ERROR:", err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        })
    }
    const success = () => {
        res.status(200).json({ success: true });
    }
    const error = error => {
        res.status(500).json({ success: false, message: error });
    }
    const isExistsAccount = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT count(*) as 'exists' FROM market.user where uid like ${id}`;
            connection.query(sql, (err, row) => {
                console.log(sql, row);
                if (!err && row && row[0]["exists"] === 1) {
                    resolve(true);
                } else {
                    reject("존재하지 않는 계정입니다.");
                }
            });
        });
    }

    isExistsAccount()
        .then(deleteMaker)
        .then(deleteDesigner)
        .then(deleteAccount)
        .then(success)
        .catch(error);
};
