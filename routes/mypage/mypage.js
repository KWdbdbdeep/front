var express = require('express');
var router = express.Router();

// 마이페이지 라우트
router.get('/', function (req, res, next) {
    res.render('mypage'); // mypage.ejs 렌더링
});

module.exports = router;
