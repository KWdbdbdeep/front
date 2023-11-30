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

// 사용자 상태(가입/변경) 변경하는 함수
async function updateUserRole(userId, newRole) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject('데이터베이스 연결 실패: ' + err);
            }
            const sql = "UPDATE User SET Role = ? WHERE Id = ?";
            connection.query(sql, [newRole, userId], (error, results) => {
                connection.release();
                if (error) {
                    return reject('데이터베이스 쿼리 실행 실패: ' + error);
                }
                resolve('등급 변경이 완료되었습니다.');
            });
        });
    });
}

module.exports = updateUserRole;
