const connection = require("../../configs/connection");

// uid, user_id, type, detail, is_read, create_time
// ai, nn , nn, text, 1 || 0, timestamp

// Create Notification
exports.CreateNotification = data => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO 
                opendesign.notification N
                SET ?
            `;
        let obj = {
            user_id: data.user_id,
            type: data.type,
        };
        if (data.detail) {
            obj.detail = data.detail;
        }
        connection.query(sql, obj, (err, _) => {
            if (!err) {
                resolve(true);
            } else {
                console.error("ERROR", err);
                reject(false);
            }
        });
    });
};

// Get Notification AND Send it
const getNotification = userId => {
    return new Promise((resolve, reject) => {

        function getCountNotReadYet() {
            return new Promise((resolve, reject) => {
                const sql = `
                SELECT 
                COUNT(*)
                FROM 
                opendesign.notification N 
                WHERE 
                N.user_id=${userId}
                AND
                N.is_read LIKE 0
                `;
                connection.query(sql, (err, row) => {
                    if (!err) {
                        resolve((row && row["COUNT(*)"]) || 0);
                    } else {
                        reject(err);
                    }
                });
            });
        }
        function getNoti(cnt) {
            return new Promise(async (resolve, reject) => {
                const sql = `
                SELECT 
                * 
                FROM 
                opendesign.notification N
                WHERE 
                N.user_id = ${userId}
                AND
                ((N.create_time <= NOW() - INTERVAL 3 MONTH) OR (N.confirm LIKE 0))
                
                ORDER BY
                N.is_read DESC, N.create_time DESC
                
                LIMIT 0, ${cnt > 100 ? cnt : 100} 
                `;
                connection.query(sql, (err, row) => {
                    if (!err) {
                        resolve(row);
                    } else {
                        reject(err);
                    }
                });
            });
        }
        getCountNotReadYet()
            .then(getNoti)
            .then(notifications => resolve(notifications))
            .catch(reject);
    });
};

exports.sendNotification = (io, socket, userId) => {
    getNotification(userId)
        .then(notifications =>
            io.to(`${socket}`)
                .emit("notification", notifications))
        .catch(error =>
            console.error(`ERROR notification: ${error}`));
};

// Update notification(update value of is_read to 1)
exports.confirmNotification = notiId => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE 
                opendesign.notification N 
            SET 
                N.is_read = 1 
            WHERE
                N.uid = ${notiId}
            `;
        connection.query(sql, (err, _) => {
            if (!err) {
                resolve(true);
            } else {
                reject(false);
            }
        });
    });
};
exports.confirmAllNotification = userId => {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE 
                opendesign.notification N
            SET 
                N.is_read = 1
            WHERE 
                N.user_id = ${userId}
                    AND
                (N.type NOT LIKE 'DESIGN_INVITE')
            `;
        connection.query(sql, (err, _) => {
            if (!err) {
                resolve(true);
            } else {
                reject(false);
            }
        });
    });
};

