var express = require('express');
var router = express.Router();
var mysql = require('mysql');
require('dotenv').config(); // 환경 변수 사용을 위해 dotenv 모듈 불러오기

// 환경 변수를 사용하여 데이터베이스 연결 풀 생성
var pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


// 기본 경로 ('/')에 대한 GET 요청 처리
router.get('/', function(req, res, next) {
  res.render('rentmap', { title: '자전거 대여소 지도' });
});

// '/stations' 경로에 대한 GET 요청 처리
router.get('/stations', function(req, res) {
  const swLat = parseFloat(req.query.swLat);
  const swLng = parseFloat(req.query.swLng);
  const neLat = parseFloat(req.query.neLat);
  const neLng = parseFloat(req.query.neLng);

  pool.getConnection(function(err, connection) {
    if (err) {
      console.error("Database connection error: ", err);
      res.status(500).send("Database connection error");
      return;
    }

    const query = `
      SELECT * FROM Rental_Office
      WHERE Latitude BETWEEN ? AND ?
      AND Longitude BETWEEN ? AND ?`;

    connection.query(query, [swLat, neLat, swLng, neLng], function(error, results) {
      connection.release();
      if (error) {
        console.error("Database query error: ", error);
        res.status(500).send("Database query error");
        return;
      }
      res.json(results);
    });
  });
});

// 자전거 반납을 처리하는 라우트
router.post('/return-bicycle', function(req, res) {
  var userId = req.session.userId; // 세션에서 사용자 아이디 가져오기
  var bikeId = req.session.bikeId; // 세션에서 자전거 ID 가져오기

  if (!userId) {
    // 사용자가 로그인하지 않았을 경우
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  pool.getConnection(function(err, connection) {
    if (err) {
      console.error("Database connection error: ", err);
      return res.status(500).send("Database connection error");
    }

    // 먼저 Rent_Start_Location을 가져오는 쿼리
    const getStartLocationQuery = 'SELECT Rent_Start_Location FROM Rent WHERE Bid = ? AND Id = ? AND Status = 1 LIMIT 1';
    connection.query(getStartLocationQuery, [bikeId, userId], function(error, results) {
      if (error || results.length === 0) {
        connection.release();
        console.error("Database query error: ", error || "No rental record found.");
        return res.status(500).send("Database query error or no rental record found.");
      }

      const rentStartLocation = results[0].Rent_Start_Location;

      // 자전거 상태를 사용 가능(1)으로 변경하는 쿼리
      var updateBikeStatusQuery = 'UPDATE Bicycle SET Status = 1 WHERE Bid = ?';
      connection.query(updateBikeStatusQuery, [bikeId], function(error, updateResults) {
        if (error) {
          connection.release();
          console.error("Database query error: ", error);
          return res.status(500).send("Database query error");
        }

        // 대여 기록을 업데이트하는 쿼리
        var updateRentRecordQuery = `
          UPDATE Rent 
          SET Rent_Finish_Date = NOW(), 
              Status = 0, 
              Rent_Finish_Location = ?
          WHERE Bid = ? AND Id = ? AND Status = 1
        `;

        connection.query(updateRentRecordQuery, [rentStartLocation, bikeId, userId], function(error, rentResults) {
          
          if (error) {
            connection.release();
            console.error("Database query error: ", error);
            return res.status(500).send("Database query error");
          }

          // 세션의 대여 정보 초기화
          // 세션의 대여 정보 중 bikeId만 초기화
          req.session.rental.bikeId = null;
          connection.release(); // 데이터베이스 연결 반환

          // 성공 응답을 보냄
          res.json({
            success: true,
            message: '자전거 반납 처리가 완료되었습니다.'
          });
        });
      });
    });
  });
});





// 자전거 대여를 처리하는 라우트
router.post('/rent-bicycle', function(req, res) {
  var userId = req.session.userId; // 세션에서 사용자 아이디 가져오기
  var rentalOfficeId = req.body.rentalOfficeId; // 클라이언트로부터 받은 대여소 ID

  if (!userId) {
    // 사용자가 로그인하지 않았을 경우
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  pool.getConnection(function(err, connection) {
    if (err) {
      // 데이터베이스 연결 에러 처리
      console.error("Database connection error: ", err);
      return res.status(500).send("Database connection error");
    }

    var findBikeQuery = 'SELECT * FROM Bicycle WHERE Status = 1 AND Rental_Office_id = ? LIMIT 1';
    connection.query(findBikeQuery, [rentalOfficeId], function(error, bikes) {
      if (error) {
        // 쿼리 실행 중 에러 발생
        connection.release();
        console.error("Database query error: ", error);
        return res.status(500).send("Database query error");
      }

      if (bikes.length === 0) {
        // 사용 가능한 자전거가 없는 경우
        connection.release();
        return res.status(404).json({ message: '해당 대여소에 사용 가능한 자전거가 없습니다.' });
      }

      var bike = bikes[0];
      var rentBikeQuery = `
        INSERT INTO Rent (Bid, Id, Rent_Start_Date, Status, Rent_Start_Location)
        VALUES (?, ?, NOW(), 1, ?)
      `;

      connection.query(rentBikeQuery, [bike.Bid, userId, rentalOfficeId], function(error, results) {
        if (error) {
          // 쿼리 실행 중 에러 발생
          connection.release();
          console.error("Database query error: ", error);
          return res.status(500).send("Database query error");
        }

        var updateBikeStatusQuery = 'UPDATE Bicycle SET Status = 0 WHERE Bid = ?'; // 자전거 상태를 대여 중(0)으로 변경
        connection.query(updateBikeStatusQuery, [bike.Bid], function(error, updateResults) {
          if (error) {
            // 쿼리 실행 중 에러 발생
            connection.release();
            console.error("Database query error: ", error);
            return res.status(500).send("Database query error");
          }

          var rentalOfficeQuery = 'SELECT * FROM Rental_Office WHERE Rental_Office_id = ?';
          connection.query(rentalOfficeQuery, [rentalOfficeId], function(error, officeResults) {
            connection.release(); // 데이터베이스 연결 반환
            if (error) {
              // 쿼리 실행 중 에러 발생
              console.error("Database query error: ", error);
              return res.status(500).send("Database query error");
            }

            var rentalOffice = officeResults[0];
            var currentTime = new Date().toISOString();

            // 세션에 대여 정보 저장
            req.session.rental = {
              bikeId: bike.Bid,
              stationName: rentalOffice.Station_Name,
              rentStartTime: currentTime,
              stationAddress: rentalOffice.Address
            };
            req.session.bikeId = bike.Bid; // 자전거 ID를 세션에 저장

             // 성공 응답을 보냄
            res.json({
              success: true,
              message: '자전거 대여 처리가 완료되었습니다.',
              bikeId: bike.Bid,
              redirect: '/' // 클라이언트가 리디렉션할 URL
            });
          });
        });
      });
    });
  });
});

module.exports = router;