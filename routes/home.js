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

router.get('/', function(req, res) {
    let userLoggedIn = req.session.loggedIn; // 세션에서 로그인 상태 확인
    let rentalInfo = req.session.rental || {}; // 세션에서 대여 정보 확인
  
    // home.ejs에 전달할 데이터 객체
    const data = {
        userLoggedIn: userLoggedIn,
        rentalSuccess: rentalInfo.bikeId ? true : false,
        bikeId: rentalInfo.bikeId,
        stationName: rentalInfo.stationName,
        rentStartTime: rentalInfo.rentStartTime,
        stationAddress: rentalInfo.stationAddress
    };
  
    res.render('home', data);
  });
  
  module.exports = router;