var express = require('express');
var router = express.Router();
var mysql = require('mysql');
require('dotenv').config(); // 환경 변수 사용을 위해 dotenv 모듈 불러오기

// 데이터베이스 연결 풀 생성
var pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// 사용자 정보 가져오기
router.get('/getUserInfo', function (req, res, next) {
  var userId = req.session.userId; // 세션에서 사용자 아이디 가져오기

  if (!userId) {
    // 사용자가 로그인하지 않았으면 로그인 페이지로 리다이렉트 또는 에러 처리
    return res.redirect('/login');
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error("Database connection failed: " + err.stack);
      return res.status(500).send('Database connection failed');
    }

    // User 테이블에서 사용자 데이터 조회
    connection.query('SELECT * FROM User WHERE id = ?', [userId], function (err, rows) {
      connection.release(); // 에러가 발생해도 연결은 해제해야 합니다.

      if (err) {
        console.error("Query error: " + err.stack);
        return res.status(500).send('Query execution failed');
      }

      if (rows.length === 0) {
        // 사용자 아이디에 해당하는 사용자가 없으면 에러 처리
        return res.status(404).send('User not found');
      }

      var user = rows[0];

      // 조회된 데이터와 함께 마이페이지 템플릿을 렌더링합니다.
      res.render('myinfo', {
        user: user,
        userId: userId
      });
    });
  });
});


// 마이페이지 라우트
router.get('/', function (req, res, next) {
  // res.render('myinfo')

  var userId = req.session.userId; // 세션에서 사용자 아이디 가져오기

  if (!userId) {
    // 사용자가 로그인하지 않았으면 로그인 페이지로 리다이렉트 또는 에러 처리
    return res.redirect('/login');
  }

  pool.getConnection(function (err, connection) {
    if (err) {
      console.error("Database connection failed: " + err.stack);
      return res.status(500).send('Database connection failed');
    }

    // User 테이블에서 사용자 데이터 조회
    connection.query('SELECT * FROM User WHERE id = ?', [userId], function (err, rows) {
      connection.release(); // 에러가 발생해도 연결은 해제해야 합니다.

      if (err) {
        console.error("Query error: " + err.stack);
        return res.status(500).send('Query execution failed');
      }

      if (rows.length === 0) {
        // 사용자 아이디에 해당하는 사용자가 없으면 에러 처리
        return res.status(404).send('User not found');
      }

      var user = rows[0];

      // 조회된 데이터와 함께 마이페이지 템플릿을 렌더링합니다.
      res.render('myinfo', {
        user: user,
        userId:userId
      });
    });
  });
});

module.exports = router;