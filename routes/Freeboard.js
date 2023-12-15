var express = require('express');
var router =express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

router.get('/', function(req, res, next) {
    res.redirect('/Freeboard/freeboard/1');
});
router.get('/freeboard/:F_Board_Id', isAuthenticated, getListCallback);
function getListCallback(req, res, next) {
    queryList((rows) => {
        console.log('rows:' + JSON.stringify(rows));
        res.render('Freeboard', { title: '게시판 조회', rows: rows });
    });
}
router.get('/', isAuthenticated, function(req, res, next) {
    res.redirect('/Freeboard/freeboard/1');
  });

function queryList(callback) {
    pool.query('SELECT F_Board_Id, F_Title, id, F_views, F_MainText,F_Image FROM FreeBoard', (err, rows, fields) => {
        if (err) throw err;
        callback(rows);
    });
}
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
      return next();
    } else {
      res.redirect('/login'); // 로그인 페이지로 리다이렉트 또는 다른 처리를 수행할 수 있습니다.
    }
  }
module.exports = {
    getList: queryList, 
    router: router
};

module.exports=router;

