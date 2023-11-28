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
        connection.query('SELECT * FROM User', function(err, rows) {
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
            res.render('manage', { title: '사용자 정보', rows: rows });
        });
    });
});

module.exports = router;
