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

router.get('/', function(req, res, next) {
    // 여기에서 로그인 여부를 확인하여 처리
    if (req.session && req.session.userId) {
        res.render('Freewrite', { title: "게시판 글쓰기",userId: req.session.userId });
    } else {
        res.redirect('/login'); // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉트
    }
});

router.post('/', function(req, res) {
    if (req.session && req.session.userId) {
    var F_Title = req.body.title;
    var F_MainText = req.body.content;
    var datas = [F_Title, F_MainText];
    insertdata(datas, () => {
        res.redirect('/Freeboard');
    }, req);
    } else {
        console.error('Invalid or missing session information');
        // 적절한 에러 처리
        res.status(403).send('Forbidden'); // 403 Forbidden 응답 전송
    }
});

function insertdata(datas, callback, req) {
    if (req && req.session && req.session.userId) {
        var userId = req.session.userId;
        var sql = "INSERT INTO FreeBoard(F_Title, F_MainText, id) VALUES(?,?,?)";
        datas.push(userId);
    pool.query(sql, datas, function(err, rows) {
        if (err) {
                console.error("err:" + err);
            }
        console.log("rows:" + JSON.stringify(rows));
        callback();
    });
    } else {
        console.error('Invalid or missing session information');
        // 적절한 에러 처리
    }
}

module.exports = router;
