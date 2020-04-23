const connection = require("../../configs/connection");

exports.DesignerList = (req, res, next) => {
    const { page, max, cate1, cate2, sort, desc, start, end, keyword } = req.params;
    const keywords = (keyword === "null" || keyword == null) ? [] : keyword.trim().split(" ");

    let options = [];
    // cates
    if (parseInt(cate1, 10) !== 0) {
        if (parseInt(cate2, 10) === 0) {
            options.push(`UD.category_level1 LIKE ${cate1}`);
        }
        else {
            options.push(`UD.category_level2 LIKE ${cate2}`);
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
            options.push(`U.create_time BETWEEN '${start}' AND '${end}'`);
        } else {
            options.push(`U.update_time BETWEEN '${start}' AND '${end}'`);
        }
    }

    const WHERE = `
        ${options.length > 0
            ? "WHERE" : ""}
           ${options.length > 0
            ? options.map(opt => opt).join(" AND ") : ""}
    `;

    let sql = `
        SELECT 
            UC.total_like, U.*

        FROM 
            opendesign.user U
        LEFT JOIN
            opendesign.user_counter UC ON UC.user_id = U.uid
        LEFT JOIN
            opendesign.user_detail UD ON UD.user_id = U.uid

        ${WHERE}

        ORDER BY 
            ${sort === "like" ? "UC.total_like" : sort === "create" ? "U.create_time" : sort === "update" ? "U.update_time" : "U.nick_name"}
            ${desc === "desc" ? "DESC" : "ASC"}
        LIMIT ${max * page}, ${max};
    `;

    // console.log(sql);

    req.sql = sql;
    next();
}
exports.DesignerListCount = (req, res, next) => {
    const { cate1, cate2, sort, start, end, keyword } = req.params;
    const keywords = (keyword === "null" || keyword == null) ? [] : keyword.trim().split(" ");

    let options = [];
    // cates
    if (parseInt(cate1, 10) !== 0) {
        if (parseInt(cate2, 10) === 0) {
            options.push(`UD.category_level1 LIKE ${cate1}`);
        }
        else {
            options.push(`UD.category_level2 LIKE ${cate2}`);
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
            options.push(`U.create_time BETWEEN '${start}' AND '${end}'`);
        } else {
            options.push(`U.update_time BETWEEN '${start}' AND '${end}'`);
        }
    }

    const WHERE = `
        ${options.length > 0
            ? "WHERE" : ""}
           ${options.length > 0
            ? options.map(opt => opt).join(" AND ") : ""}
    `;

    let sql = `
        SELECT 
            COUNT(*) AS 'cnt'
        FROM 
            opendesign.user U
        LEFT JOIN
            opendesign.user_counter UC ON UC.user_id = U.uid
        LEFT JOIN
            opendesign.user_detail UD ON UD.user_id = U.uid
        ${WHERE}
        `;
    const getCount = () => {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                if (!err && result.length) {
                    resolve(result[0]);
                } else {
                    reject(err);
                }
            })
        })
    }

    getCount()
        .then(num => res.status(200).json(num))
        .catch(err => res.status(500).json(err))
}
exports.DeleteDesigner = (req, res, _) => {
    const designerId = req.params.id;

    const deleteDesigner = (id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM opendesign.user WHERE uid = ${id}`;
            connection.query(sql, (err, _) => {
                if (err) {
                    console.error("DELETE DESIGNER ERROR:", err);
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

    deleteDesigner(designerId)
        .then(success)
        .catch(error);
}
