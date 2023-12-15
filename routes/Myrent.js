var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// 대여 정보 조회
router.get('/', readData);

function readData(req, res, next) {
    var userId = req.session.userId;

    if (!userId) {
        console.error('Invalid or missing user ID');
        return res.redirect('/login');
    }

    // 대여 정보 조회 로직
    getData(userId, (rows) => {
        console.log('대여 정보 조회 결과 확인:', rows);

        res.render('Myrent', { title: "대여 정보 조회", rows: rows, userId: userId });
    });
}

function getData(userId, callback) {
    pool.query('SELECT * FROM Rent WHERE Id = ?', [userId], (err, rows, fields) => {
        if (err) {
            console.error(err);
            return callback([]);
        }
        callback(rows);
    });
}

module.exports = router;
