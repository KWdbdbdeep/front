var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
require('dotenv').config(); // 환경 변수 사용을 위해 dotenv 모듈 불러오기

// 데이터베이스 연결 풀 생성
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

/* GET home page. */
router.get('/', async function(req, res) {
    function calculateAge(birthday) {
        var today = new Date();
        var birthDate = new Date(birthday);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    
    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Database connection failed: " + err.stack);
            return res.status(500).send('Database connection failed');
        }

        // User 테이블에서 모든 사용자 데이터를 조회합니다.
        connection.query('SELECT * FROM User WHERE UStatus = 1', function(err, rows) {
            connection.release(); // 에러가 발생해도 연결은 해제해야 합니다.

            if (err) {
                console.error("Query error: " + err.stack);
                return res.status(500).send('Query execution failed');
            }

            rows.forEach(row => {
                row.Age = calculateAge(row.Birthday);
                row.StatusDisplay = row.UStatus === 1 ? '가입' : '탈퇴';
            });

            // 조회된 데이터와 함께 웹 페이지를 렌더링합니다.
            res.render('userInfo', { title: '사용자 정보', subtitle: '가입 회원 정보 조회', rows: rows });
        });
    });
});

// 사용자 등급 변경을 처리하는 라우트
router.post('/changeRole', async (req, res) => {
    const userId = req.body.id;
    const newRole = req.body.role;

    try {
        const message = await updateUserRole(userId, newRole);
        res.send({ message: message });
    } catch ( error ) {
        res.status(500).send({ error: error });
    }
});

// 사용자 등급을 변경하는 함수
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

module.exports = router;
