var express = require('express');
var router = express.Router();
var mysql = require('mysql');

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
  pool.getConnection(function(err, connection) {
    if (err) {
      console.error("Database connection error: ", err);
      res.status(500).send("Database connection error");
      return;
    }

    connection.query('SELECT * FROM Rental_Office', function(error, results, fields) {
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

// 자전거 대여를 처리하는 라우트
router.post('/rent-bicycle', function(req, res) {
  var userId = req.session.userId; // 세션에서 사용자 아이디 가져오기
  var rentalOfficeId = req.body.rentalOfficeId; // 클라이언트로부터 받은 대여소 ID

  if (!userId) {
    // 사용자가 로그인하지 않았으면 에러 메시지와 함께 응답
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  // 데이터베이스에서 해당 대여소 ID를 가진 사용 가능한 자전거를 찾습니다.
  pool.getConnection(function(err, connection) {
    if (err) {
      console.error("Database connection error: ", err);
      return res.status(500).send("Database connection error");
    }

    // 해당 대여소에 속한 사용 가능한 자전거를 찾는 쿼리
    var findBikeQuery = 'SELECT * FROM Bicycle WHERE Status = 1 AND Rental_Office_id = ? LIMIT 1';
    connection.query(findBikeQuery, [rentalOfficeId], function(error, bikes) {
      if (error) {
        connection.release();
        console.error("Database query error: ", error);
        return res.status(500).send("Database query error");
      }

      if (bikes.length === 0) {
        connection.release();
        return res.status(404).json({ message: '해당 대여소에 사용 가능한 자전거가 없습니다.' });
      }

      var bike = bikes[0]; // 사용 가능한 자전거 중 하나를 선택합니다.

      // 대여 기록을 `Rent` 테이블에 추가하는 쿼리
      var rentBikeQuery = `
        INSERT INTO Rent (Bid, Id, Rent_Start_Date, Status, Rent_Start_Location)
        VALUES (?, ?, NOW(), TRUE, ?)
      `;
      connection.query(rentBikeQuery, [bike.Bid, userId, rentalOfficeId], function(error, results) {
        if (error) {
          connection.release();
          console.error("Database query error: ", error);
          return res.status(500).send("Database query error");
        }

        // 성공적으로 대여 기록을 추가했다면, 자전거 상태를 '사용 중'으로 변경합니다.
        var updateBikeStatusQuery = 'UPDATE Bicycle SET Status = 1 WHERE Bid = ?';
        connection.query(updateBikeStatusQuery, [bike.Bid], function(error, updateResults) {
          connection.release();
          if (error) {
            console.error("Database query error: ", error);
            return res.status(500).send("Database query error");
          }

          // 모든 처리가 성공적으로 완료되면 클라이언트에게 성공 메시지를 보냅니다.
          res.json({ success: true, message: '자전거 대여 처리가 완료되었습니다.', bikeId: bike.Bid });
        });
      });
    });
  });
});


module.exports = router;