const connection = require("../../configs/connection");

exports.TopGroupList = (req, res, next) => {
    let sql = `
        SELECT
            CG.order, G.*
        FROM
            opendesign.group G 
        LEFT JOIN 
            opendesign.collection_group CG ON CG.group_id = G.uid
        WHERE
            G.uid IN (SELECT group_id FROM opendesign.collection_group)
        ORDER BY CG.order ASC;
        `;

    req.sql = sql;
    next();
}
exports.TopGroupListCount = (req, res, next) => {
    let sql = `
    SELECT
        COUNT(*)
    FROM
        opendesign.group G
    WHERE
        G.uid IN (SELECT group_id FROM opendesign.collection_group)
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

exports.GroupList = (req, res, next) => {
    const { page, max, sort, desc, start, end, keyword } = req.params;
    const keywords = keyword === "null" || keyword == null ? [] : keyword.trim().split(" ");

    let sql = `
        SELECT 
            GC.like, U.nick_name, G.*
        FROM 
            opendesign.group G 
        LEFT JOIN
            opendesign.group_counter GC ON GC.group_id = G.uid
        LEFT JOIN
            opendesign.user U ON U.uid = G.user_id

        WHERE
            G.uid NOT IN (SELECT group_id FROM opendesign.collection_group)
            
        ${keywords.length === 0
            ? ``
            : keywords.map(word => `AND (G.title LIKE "%${word}%" OR U.nick_name LIKE "%${word}%")`)}
        
        ${start === "null" || end === "null"
            ? ``
            : sort === `create`
                ? `AND G.create_time BETWEEN '${start}' AND '${end}'`
                : `AND G.update_time BETWEEN '${start}' AND '${end}'`}

        ORDER BY 
            ${sort === "like" ? "GC.like" : sort === "create" ? "G.create_time" : sort === "update" ? "G.update_time" : "G.title"}
            ${desc === "desc" ? "DESC" : "ASC"}

        LIMIT ${ max * page}, ${max};
        `;
    // console.log(sql);
    req.sql = sql;
    next();
}

exports.GroupListCount = (req, res, next) => {
    const { sort, start, end, keyword } = req.params;
    const keywords = keyword === "null" || keyword == null ? [] : keyword.trim().split(" ");
    // console.log(req.params);

    let sql = `
        SELECT 
            COUNT(*) AS 'cnt'
        FROM 
            opendesign.group G
        LEFT JOIN
            opendesign.group_counter GC ON GC.group_id = G.uid
        LEFT JOIN
            opendesign.user U ON U.uid = G.user_id

        WHERE
            G.uid NOT IN (SELECT group_id FROM opendesign.collection_group)
            
        ${keywords.length === 0
            ? ``
            : keywords.map(word => `AND (G.title LIKE "%${word}%" OR U.nick_name LIKE "%${word}%")`)}
        
        ${start === "null" || end === "null"
            ? ``
            : sort === `create`
                ? `AND G.create_time BETWEEN '${start}' AND '${end}'`
                : `AND G.update_time BETWEEN '${start}' AND '${end}'`}
        `;
    // console.log(sql);

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

exports.DeleteGroup = (req, res, _) => {
    const groupId = req.params.id;
    const deleteGroup = (id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM opendesign.group WHERE uid = ${id}`;
            connection.query(sql, (err, _) => {
                if (err) {
                    console.error("DELETE GROUP ERROR:", err);
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
    deleteGroup(groupId)
        .then(success)
        .catch(error);
}


