const connection = require("../../configs/connection");

exports.MakerList = (req, res, next) => {
    const { page, max, cate1, cate2, sort, desc, start, end, keyword } = req.params;
    const keywords = (keyword === "null" || keyword == null) ? [] : keyword.trim().split(" ");

    let options = [];
    // cates
    if (parseInt(cate1, 10) !== 0) {
        if (parseInt(cate2, 10) === 0) {
            options.push(`E.category_level1 LIKE ${cate1}`);
        }
        else {
            options.push(`E.category_level2 LIKE ${cate2}`);
        }
    }
    // keyword
    if (keywords.length !== 0) {
        keywords.map(word =>
            options.push(`U.nick_name LIKE "%${word}%"`))
    }
    // dates
    if (start !== "null" && end !== "null") {
        if (sort === `create`) {
            options.push(`E.create_time BETWEEN '${start}' AND '${end}'`);
        } else {
            options.push(`E.update_time BETWEEN '${start}' AND '${end}'`);
        }
    }

    const WHERE = `
        WHERE 
            E.\`type\` LIKE 'maker' 
                AND
            E.uid NOT IN (SELECT expert_id FROM market.top_maker)

        ${options.length > 0
            ? "AND " : ""}
           ${options.length > 0
            ? options.map(opt => opt).join(" AND ") : ""}
    `;

    // LEFT JOIN
    // market.user_detail UD ON UD.user_id = U.uid
    let sql = `
        SELECT
            U.uid as user_id, E.uid, E.thumbnail_id as 'thumbnail', U.nick_name, U.email,
            E.category_level1, E.category_level2, E.create_time, E.update_time
        FROM
            market.expert E
        LEFT JOIN
            market.user U ON U.uid = E.user_id
        
        ${WHERE}

        ORDER BY
            ${sort === "create" ? "E.create_time" : sort === "update" ? "E.update_time" : "U.nick_name"}
            ${desc === "desc" ? "DESC" : "ASC"}
        LIMIT ${max * page}, ${max};
    `;
    // console.log(sql);
    req.sql = sql;
    next();
}

exports.MakerListCount = (req, res, next) => {
    const { page, max, cate1, cate2, sort, desc, start, end, keyword } = req.params;
    const keywords = (keyword === "null" || keyword == null) ? [] : keyword.trim().split(" ");

    let options = [];
    // cates
    if (parseInt(cate1, 10) !== 0) {
        if (parseInt(cate2, 10) === 0) {
            options.push(`E.category_level1 LIKE ${cate1}`);
        }
        else {
            options.push(`E.category_level2 LIKE ${cate2}`);
        }
    }
    // keyword
    if (keywords.length !== 0) {
        keywords.map(word =>
            options.push(`U.nick_name LIKE "%${word}%"`))
    }
    // dates
    if (start !== "null" && end !== "null") {
        if (sort === `create`) {
            options.push(`E.create_time BETWEEN '${start}' AND '${end}'`);
        } else {
            options.push(`E.update_time BETWEEN '${start}' AND '${end}'`);
        }
    }

    const WHERE = `
        WHERE E.\`type\` LIKE 'maker' 
        ${options.length > 0
            ? "AND " : ""}
           ${options.length > 0
            ? options.map(opt => opt).join(" AND ") : ""}
    `;

    // LEFT JOIN
    // market.user_detail UD ON UD.user_id = U.uid
    let sql = `
        SELECT
           COUNT(*) AS 'cnt' 
        FROM
            market.expert E
        LEFT JOIN
            market.user U ON U.uid = E.user_id
        ${WHERE}
    `;

    const getCount = () => {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                console.log(result);
                if (!err && result.length) {
                    resolve(result[0]);
                } else {
                    console.log(err);
                    reject(err);
                }
            })
        })
    }

    getCount()
        .then(num => res.status(200).json(num))
        .catch(err => res.status(500).json(err))
}

exports.DeleteMaker = (req, res, _) => {
    const id = req.params.id;
    const deleteMaker = () => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.expert WHERE uid = ${id}`;
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
    const error = (err) => {
        res.status(500).json({ success: false, message: err });
    }
    deleteMaker()
        .then(success)
        .catch(error);
}