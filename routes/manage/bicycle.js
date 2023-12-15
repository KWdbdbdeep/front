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
// 따릉이 정보를 조회하는 라우트
// 따릉이 정보를 조회하는 라우트
// 따릉이 정보를 조회하는 라우트
router.get('/', function(req, res) {
    const pageNum = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (pageNum - 1) * limit;

    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Database connection failed: " + err.stack);
            return res.status(500).send('Database connection failed');
        }

        // 전체 따릉이 수를 가져오는 쿼리
        connection.query('SELECT COUNT(*) AS count FROM Bicycle', function(err, countResult) {
            if (err) {
                connection.release();
                console.error("Query error: " + err.stack);
                return res.status(500).send('Query execution failed');
            }

            const totalPageNum = Math.ceil(countResult[0].count / limit);

            // 실제 따릉이 데이터를 가져오는 쿼리
            connection.query('SELECT * FROM Bicycle LIMIT ? OFFSET ?', [limit, offset], function(err, rows) {
                connection.release();

                if (err) {
                    console.error("Query error: " + err.stack);
                    return res.status(500).send('Query execution failed');
                }

                res.render('bicycle', {
                    title: '따릉이 관리',
                    subtitle: '따릉이 상태 조회',
                    rows: rows,
                    currentPage: pageNum,
                    totalPageNum: totalPageNum
                });
            });
        });
    });
});


// 따릉이 상태를 변경하는 라우트
router.post('/changeBicycleStatus', function(req, res) {
    const bicycleId = req.body.id;
    const newStatus = req.body.status;

    pool.getConnection(function(err, connection) {
        if (err) {
            console.error("Database connection failed: " + err.stack);
            return res.status(500).send('Database connection failed');
        }

        connection.query('UPDATE Bicycle SET Status = ? WHERE Bid = ?', [newStatus, bicycleId], function(err, result) {
            connection.release();

            if (err) {
                console.error("Query error: " + err.stack);
                return res.status(500).send('Query execution failed');
            }

            res.send({ message: '따릉이 상태가 변경되었습니다.' });
        });
    });
});

module.exports = router;
