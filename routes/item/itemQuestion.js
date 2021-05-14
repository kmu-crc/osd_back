const connection = require("../../configs/connection");
// const { getItemQuestion, itemQuestionDelete, itemQuestionCreate } = require("./itemQuestion");

// Get Questions
exports.GetQuestion = (req, res, next) => {
    const id = req.params.id;
    const page = req.params.page;

    const getQuestion = id => {
        return new Promise((resolve, reject) => {
            const sql =
                `SELECT 
                    Q.uid, Q.group_id, Q.sort_in_group, Q.user_id, Q.item_id, Q.comment, Q.create_time,
                    U.nick_name, T.s_img
                FROM market.question Q
                    LEFT JOIN market.user U ON U.uid=Q.user_id 
                    LEFT JOIN market.thumbnail T ON T.uid=U.thumbnail
                WHERE Q.item_id=${id}
                ORDER BY group_id DESC, sort_in_group ASC
                LIMIT ${page * 10}, 10`;

            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };
    const getTotalCount = id => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT COUNT(*) AS 'total' FROM market.question Q WHERE Q.item_id=${id} AND Q.sort_in_group=0;`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]["total"]);
                } else {
                    reject(err);
                }
            });
        });
    };
    const getBeforeReplyCount=id=>{
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM market.question Q WHERE Q.item_id=${id} AND Q.sort_in_group!=0 LIMIT 0,${page*10};`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row.length);
                } else {
                    reject(err);
                }
            });
        });
    } 


    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    let data = null;
    getQuestion(id)
        .then(questions => {
            data = { questions: questions };
            return getTotalCount(id);
        })
        .then(total => {
            data = { ...data, total: total };
            return getBeforeReplyCount(id);
        })
        .then(replyCount=>{
            data = { ...data, replyCount:replyCount };
            return data;
        })
        .then(success)
        .catch(failure);
};

// Delete Questions
exports.RemoveQuestion = (req, res, next) => {
    const id = parseInt(req.params.id, 10);

    const removeQuestion = id => {
        return new Promise((resolve, reject) => {
            const sql = `DELETE FROM market.question WHERE uid=${id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };

    const success = data => { res.status(200).json({ success: true, data: { ...data } }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    removeQuestion(id)
        .then(success)
        .catch(failure);
};

// Create Questions
exports.CreateQuestion = (req, res, next) => {
    const { NewAlarm } = require("../../socket");

    const id = parseInt(req.params.id, 10);
    const user_id = req.decoded.uid;
    const _ = req.body;
    let owner=-1;

    const updateSortForDESC = id => {
        // 1.UPDATE BOARD SET SORTS = SORTS + 1 
        // WHERE BGROUP =  (원글의 BGROUP)  AND SORTS >(원글의 SORTS)
        return new Promise((resolve, reject) => {
            if (_.group_id == null) resolve(id);
            const sql = `UPDATE market.question SET sort_in_group = sort_in_group + 1
                         WHERE group_id=${_.group_id} AND sort_in_group>${_.sort_in_group}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(id);
                } else {
                    reject(err);
                }
            });
        });
    }
    const createAnswer = id => {
        console.log("create question", _);
        // 2. INSERT INTO BOARD VALUES (번호, (원글의 BGROUP), (원글의 SORTS +1), (원글의 DEPTH +1) ,' 제목')
        return new Promise((resolve, reject) => {
            const data = { group_id: _.group_id, sort_in_group: _.sort_in_group + 1, user_id: user_id, item_id: id, comment: _.comment };
            const sql = `INSERT INTO market.question SET ?`;
            connection.query(sql, data, (err, row) => {
                if (!err) {
                    console.log(sql, row)
                    resolve(row);
                } else {
                    reject(err);
                }
            });
        });
    };
    const createQuestion = id => {
        return new Promise((resolve, reject) => {
            const data = { group_id: _.group_id, sort_in_group: 0, user_id: user_id, item_id: id, comment: _.comment };
            const sql = `INSERT INTO market.question SET ?`;
            connection.query(sql, data, (err, row) => {
                if (!err) {
                    resolve(row.insertId);
                } else {
                    reject(err);
                }
            });
        });
    };
    const giveGroupId = id => {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE market.question SET group_id=${id} WHERE uid=${id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(true);
                } else {
                    reject(err);
                }
            });
        });
    };
    const getOwner = () => {
        return new Promise((resolve, reject) => {
            const sql = `SELECT user_id AS owner FROM market.item WHERE uid=${id}`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    console.log("question!!!!!",user_id,row[0].owner,id)

                    resolve(row[0]);
                } else {
                    reject(err);
                }
            });
        });
    };
    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    // answer
    if (_.group_id) {
        updateSortForDESC(id)
            .then(createAnswer)
            .then(success)
            .catch(failure);
        }
        // question
        else {
            createQuestion(id)
            .then(giveGroupId)
            .then(success)
            .then(getOwner)
            .then(data=>NewAlarm({ type: "ITEM_QUESTION_TO_OWNER", from: user_id, to: data.owner, item_id: id, })) // to buyer
            .catch(failure);
    }
};
