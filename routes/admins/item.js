const connection = require("../../configs/connection");

exports.TopItemList = (req, res, next) => {
    let sql = `
    SELECT
            TI.order, I.*
        FROM
            market.item I
        LEFT JOIN 
            market.top_item TI ON TI.item_id = I.uid
        WHERE
            I.uid  IN (SELECT item_id FROM market.top_item)
        ORDER BY TI.order ASC;
        `;

    req.sql = sql;
    next();
}

// exports.TopDesignListCount = (req, res, next) => {
//     let sql = `
//     SELECT
//         COUNT(*)
//     FROM
//         opendesign.design D
//     WHERE
//         D.uid  IN (SELECT design_id FROM opendesign.collection_design)
//     `;

//     const getCount = () => {
//         return new Promise((resolve, reject) => {
//             connection.query(sql, (err, result) => {
//                 if (!err && result.length) {
//                     resolve(result[0]);
//                 } else {
//                     reject(err);
//                 }
//             })
//         })
//     }

//     getCount()
//         .then(num => res.status(200).json(num))
//         .catch(err => res.status(500).json(err))
// }

exports.ItemList = (req, res, next) => {
    const { page, max, cate1, cate2, sort, desc, start, end, keyword } = req.params;
    const keywords = keyword === "null" || keyword == null ? [] : keyword.trim().split(" ");
    // console.log(req.params);

    let sql = `
        SELECT 
            U.nick_name, I.*
        FROM 
            market.item I
        LEFT JOIN
            market.like IL ON IL.to_id = I.uid
        LEFT JOIN
            market.user U ON U.uid = I.user_id

        WHERE
            I.uid NOT IN (SELECT item_id FROM market.top_item)
            
        ${keywords.length === 0
            ? ``
            : keywords.map(word => `AND (I.title LIKE "%${word}%" OR U.nick_name LIKE "%${word}%")`)}
        
        ${start === "null" || end === "null"
            ? ``
            : sort === `create`
                ? `AND I.create_time BETWEEN '${start}' AND '${end}'`
                : `AND I.update_time BETWEEN '${start}' AND '${end}'`}

        ${
            // parseInt(cate1, 10) === 0
            // ? ``
            // : parseInt(cate2, 10) === 0
            //     ? `AND I.category_level1 LIKE ${cate1}`
            //     : `AND I.category_level2 LIKE ${cate2}`
            parseInt(cate1,10)===0?
            ``:`AND I.category_level1 LIKE ${cate1}`
        }

        ${
            parseInt(cate2, 10) === 0?
            ``:`AND I.category_level2 LIKE ${cate2}`
        }

        ORDER BY 
            ${sort === "create" ? "I.create_time" : sort === "update" ? "I.update_time" : "I.title"}
            ${desc === "desc" ? "DESC" : "ASC"}

        LIMIT ${ max * page}, ${max};
        `;
    // console.log(sql);
    req.sql = sql;
    next();
}

exports.ItemListCount = (req, res, next) => {
    const { cate1, cate2, sort, start, end, keyword } = req.params;
    const keywords = keyword === "null" || keyword == null ? [] : keyword.trim().split(" ");
    
    let sql = `
        SELECT 
            COUNT(*) as cnt
        FROM 
            market.item I
        LEFT JOIN
            market.like IL ON IL.to_id = I.uid
        LEFT JOIN
            market.user U ON U.uid = I.user_id

        WHERE
            I.uid NOT IN (SELECT item_id FROM market.top_item)
            
        ${keywords.length === 0
            ? ``
            : keywords.map(word => `AND (I.title LIKE "%${word}%" OR U.nick_name LIKE "%${word}%")`)}

        ${start === "null" || end === "null"
            ? ``
            : sort === `create`
                ? `AND I.create_time BETWEEN '${start}' AND '${end}'`
                : `AND I.update_time BETWEEN '${start}' AND '${end}'`}

        ${parseInt(cate1, 10) === 0
            ? ``
            : parseInt(cate2, 10) === 0
                ? `AND I.category_level1 LIKE ${cate1}`
                : `AND I.category_level2 LIKE ${cate2}`
        }
        `;

    const getCount = () => {
        console.log(sql);
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, result) => {
                console.log(result);
                if (!err && result.length) {
                    console.log("getCount=====");
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

exports.DeleteItem = (req, res, _) => {
    const designId = req.params.id;
    const deleteDesign = (id) => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.item WHERE uid = ${id}`;
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