var mysql = require('mysql');
require('dotenv').config();

// 데이터베이스 연결 풀 생성
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

async function updateUserStatus(userId, newStatus) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject('데이터베이스 연결 실패: ' + err);
            }
            const sql = "UPDATE User SET UStatus = ? WHERE Id = ?";
            connection.query(sql, [newStatus, userId], (error, results) => {
                connection.release();
                if (error) {
                    return reject('데이터베이스 쿼리 실행 실패: ' + error);
                }
                resolve('상태 변경이 완료되었습니다.');
            });
        });
    });
}

module.exports = updateUserStatus;