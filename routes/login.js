var express = require('express');
const session = require('express-session');

var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt');
require('dotenv').config();


const app = express();

// 세션 미들웨어 설정
app.use(session({
  secret: 'your_secret_key', // 세션 데이터 암호화를 위한 비밀 키
  resave: false, // 세션 데이터의 저장 여부
  saveUninitialized: true, // 초기화되지 않은 세션 데이터 저장 여부
  cookie: {
    secure: false, // HTTPS를 통해서만 세션 전송할 경우 true로 설정
    maxAge: 3600000 // 세션의 유효 시간 (밀리초)
  }
}));

// 데이터베이스 연결 풀 생성
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

router.get('/', function (req, res, next) {
    res.render('login', {
        title: 'Login Form!'
    });
});

router.post('/', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var errorMessage = ''; // 에러 메시지를 저장할 변수 추가

    // 데이터베이스에서 사용자 정보 조회
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error("Database connection failed: " + err.stack);
            return res.status(500).send('Database connection failed');
        }

        connection.query('SELECT * FROM User WHERE Id = ?', [username], function (err, results) {
            connection.release();

            if (err) {
                console.error("Query error: " + err.stack);
                return res.status(500).send('Query execution failed');
            }

            if (results.length === 0) {
                errorMessage = '아이디(로그인 전용 아이디) 또는 비밀번호를 잘못 입력했습니다.<br>입력하신 내용을 다시 확인해주세요.'; // 에러 메시지 설정
                return res.render('login', {
                    title: 'Login Form!',
                    error: errorMessage
                });
                // return res.status(401).send('No user found with that username');
            }

            var user = results[0];

            // 비밀번호 확인
            bcrypt.compare(password, user.Pw, function (err, isMatch) {
                if (err) {
                    return res.status(500).send('Error while checking password');
                }

                if (!isMatch) {
                    errorMessage = '아이디(로그인 전용 아이디) 또는 비밀번호를 잘못 입력했습니다.<br>입력하신 내용을 다시 확인해주세요.'; // 에러 메시지 설정
                    return res.render('login', {
                        title: 'Login Form!',
                        error: errorMessage
                    }); // 로그인 화면을 렌더링하면서 에러 메시지 전달

                    // return res.status(401).send('Password does not match');
                }

                // 로그인 성공: 사용자 정보를 세션에 저장
                req.session.userId = user.Id;
                req.session.loggedIn = true;

                if (user.Role === "Admin") {
                    res.redirect('/manage');
                } else {
                    // 일반 사용자일 경우 홈 화면으로 리디렉션
                    res.redirect('/');
                }
            });
        });
    });
});

module.exports = router;