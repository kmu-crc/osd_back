const connection = require("../../configs/connection");
// const { getItemQuestion, itemQuestionDelete, itemQuestionCreate } = require("./itemQuestion");

// Get Questions
exports.GetPaymentMessage = (req, res, next) => {
    const id = req.params.id;
    const page = req.params.page;
    const getQuestion = id => {
        return new Promise((resolve, reject) => {
            const sql =
              `SELECT * FROM market.purchaseMessage where payment_id=${id};`;
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
            const sql = `SELECT COUNT(*) AS 'total' FROM market.question Q WHERE Q.item_id=${id};`;
            connection.query(sql, (err, row) => {
                if (!err) {
                    resolve(row[0]["total"]);
                } else {
                    reject(err);
                }
            });
        });
    };

    const success = data => {console.log(data); res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    let data = null;
    getQuestion(id)
        .then(msg => {
            data={purchaseMessageList:msg};
            console.log(data);
            return data;
            // data = { questions: questions };
            // return getTotalCount(id);
        })
        // .then(total => {
        //     data = { ...data, total: total };
        //     return data;
        // })
        .then(success)
        .catch(failure);
};

// Delete Questions
exports.RemovePaymentMessage = (req, res, next) => {
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
exports.CreatePaymentMessage = (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    const user_id = req.decoded.uid;
    const data = req.body;
    console.log(req.body);
    const createMessage = () => {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO market.purchaseMessage SET ?`;
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

    const success = data => { res.status(200).json({ success: true, data: data }) };
    const failure = err => { res.status(500).json({ success: false, data: err }) };

    createMessage(id)
            .then(success)
            .catch(failure);
};