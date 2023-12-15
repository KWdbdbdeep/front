const express = require('express');
const router = express.Router();

// multer 같은 미들웨어를 사용하여 파일 업로드를 처리할 수 있습니다.
const multer = require('multer');
const util = require('util');
const path = require('path'); // path 모듈 불러오기
var mysql = require('mysql');

const app = express();

// // 세션 미들웨어 설정
// app.use(session({
//     secret: 'dbproject2023', // 세션 데이터 암호화를 위한 비밀 키
//     resave: false, // 세션 데이터의 저장 여부
//     saveUninitialized: true, // 초기화되지 않은 세션 데이터 저장 여부
//     cookie: {
//       secure: false, // HTTPS를 통해서만 세션 전송할 경우 true로 설정
//       maxAge: 3600000 // 세션의 유효 시간 (밀리초)
//     }
//   }));

// 데이터베이스 연결 풀 생성
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


pool.query = util.promisify(pool.query); // query 메소드를 프로미스화

// 파일 저장을 위한 multer 설정
const storage = multer.diskStorage({
    // 저장될 경로 설정
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // 'uploads/'는 서버의 로컬 디렉토리 경로
    },
    // 파일 이름 설정
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// multer 인스턴스 생성
const upload = multer({ storage: storage });

// '/updateUserInfo' 경로에 대한 POST 요청을 처리하는 라우터
router.post('/updateUserInfo', upload.single('newImage'), async (req, res) => {
    // req.body에서 폼 데이터를 추출
    const { newName, newEmail, newPhone, newAddress } = req.body;
    const imagePath = req.file ? req.file.path : null; // 파일이 업로드된 경우 경로 저장

    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
        }
        const userId = req.session.userId; // 세션에서 사용자 ID 가져오기
        
        // 쿼리를 사용하여 데이터베이스 업데이트
        const result = await pool.query(
            'UPDATE User SET Name = ?, Email = ?, PhoneNum = ?, Address = ?, Image = ? WHERE Id = ?', 
            [newName, newEmail, newPhone, newAddress, imagePath, userId]
        );
        res.json({ success: true, redirectUrl: '/myinfo' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
