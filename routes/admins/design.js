const connection = require("../../configs/connection");

exports.TopDesignList = (req, res, next) => {
    let sql = `
    SELECT
            CD.order, D.*
        FROM
            opendesign.design D
        LEFT JOIN 
            opendesign.collection_design CD ON CD.design_id = D.uid
        WHERE
            D.uid  IN (SELECT design_id FROM opendesign.collection_design)
        ORDER BY CD.order ASC;
        `;

    req.sql = sql;
    next();
}
exports.TopDesignListCount = (req, res, next) => {
    let sql = `
    SELECT
        COUNT(*)
    FROM
        opendesign.design D
    WHERE
        D.uid  IN (SELECT design_id FROM opendesign.collection_design)
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

exports.DesignList = (req, res, next) => {
    const { page, max, cate1, cate2, sort, desc, start, end, keyword } = req.params;
    const keywords = keyword === "null" || keyword == null ? [] : keyword.trim().split(" ");
    // console.log(req.params);

    let sql = `
        SELECT 
            DC.like_count, U.nick_name, D.*
        FROM 
            opendesign.design D
        LEFT JOIN
            opendesign.design_counter DC ON DC.design_id = D.uid
        LEFT JOIN
            opendesign.user U ON U.uid = D.user_id

        WHERE
            D.uid NOT IN (SELECT design_id FROM opendesign.collection_design)
            
        ${keywords.length === 0
            ? ``
            : keywords.map(word => `AND (D.title LIKE "%${word}%" OR U.nick_name LIKE "%${word}%")`)}
        
        ${start === "null" || end === "null"
            ? ``
            : sort === `create`
                ? `AND D.create_time BETWEEN '${start}' AND '${end}'`
                : `AND D.update_time BETWEEN '${start}' AND '${end}'`}

        ${parseInt(cate1, 10) === 0
            ? ``
            : parseInt(cate2, 10) === 0
                ? `AND D.category_level1 LIKE ${cate1}`
                : `AND D.category_level2 LIKE ${cate2}`
        }

        ORDER BY 
            ${sort === "like" ? "DC.like_count" : sort === "create" ? "D.create_time" : sort === "update" ? "D.update_time" : "D.title"}
            ${desc === "desc" ? "DESC" : "ASC"}

        LIMIT ${ max * page}, ${max};
        `;
    // console.log(sql);
    req.sql = sql;
    next();
}

exports.DesignListCount = (req, res, next) => {
    const { cate1, cate2, sort, start, end, keyword } = req.params;
    const keywords = keyword === "null" || keyword == null ? [] : keyword.trim().split(" ");
    // console.log(req.params);

    let sql = `
        SELECT 
            COUNT(*) AS 'cnt'
        FROM 
            opendesign.design D
        LEFT JOIN
            opendesign.design_counter DC ON DC.design_id = D.uid
        LEFT JOIN
            opendesign.user U ON U.uid = D.user_id

        WHERE
            D.uid NOT IN (SELECT design_id FROM opendesign.collection_design)
            
        ${keywords.length === 0
            ? ``
            : keywords.map(word => `AND (D.title LIKE "%${word}%" OR U.nick_name LIKE "%${word}%")`)}
        
        ${start === "null" || end === "null"
            ? ``
            : sort === `create`
                ? `AND D.create_time BETWEEN '${start}' AND '${end}'`
                : `AND D.update_time BETWEEN '${start}' AND '${end}'`}

        ${parseInt(cate1, 10) === 0
            ? ``
            : parseInt(cate2, 10) === 0
                ? `AND D.category_level1 LIKE ${cate1}`
                : `AND D.category_level2 LIKE ${cate2}`
        }
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

exports.DeleteDesign = (req, res, _) => {
    const designId = req.params.id;
    const deleteDesign = (id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM opendesign.design WHERE uid = ${id}`;
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
    deleteDesign(designId)
        .then(success)
        .catch(error);
}