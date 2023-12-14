var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
require('dotenv').config();
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

router.get('/', function(req, res, next) {
    res.render('register', {title: 'Join Form!'});
  });

router.post('/', function(req, res) {
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    var phone = req.body.phone1 + req.body.phone2 + req.body.phone3;
    var gender = req.body.gender;
    var birthday = req.body.birthday; // 생일 데이터 추출
    var address = req.body.address; // 주소 데이터 추출

    // 간단한 유효성 검사
    if (!name || !username || !email || !password || password !== confirmPassword) {
        // 유효성 검사 실패
        res.status(400).send('입력된 데이터가 올바르지 않습니다.');
    } else {
        // 비밀번호 해시 처리
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                console.error('비밀번호 해시 처리 중 오류 발생: ', err); // 오류 내용을 서버 콘솔에 기록
                return res.status(500).send('비밀번호 해시 처리 중 오류 발생');
            }
            // 데이터베이스에 사용자 정보 저장
            pool.getConnection(function(err, connection) {
                if (err) {
                    console.error('데이터베이스 쿼리 실행 실패:', err); // 오류 내용을 서버 콘솔에 기록
                    return res.status(500).send('데이터베이스 연결 실패');
                }
                var sql = "INSERT INTO User (Id, Pw, Email, Name, PhoneNum, Gender, Birthday, Address, UStatus, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'User')";
                var values = [username, hash, email, name, phone, gender, birthday, address];
                connection.query(sql, values, function(err, result) {
                    connection.release();
                    if (err) {
                        return res.status(500).send('데이터베이스 쿼리 실행 실패');
                    }
                    // res.send('회원가입이 성공적으로 완료되었습니다.');
                    res.redirect('/login');
                });
            });
        });
    }

});

module.exports = router;
