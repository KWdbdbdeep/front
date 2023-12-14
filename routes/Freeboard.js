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
router.get('/freeboard/:idx', getListCallback);
function getListCallback(req, res, next) {
    queryList((rows) => {
        console.log('rows:' + JSON.stringify(rows));
        res.render('Freeboard', { title: '게시판 조회', rows: rows });
    });
}

function queryList(callback) {
    pool.query('SELECT F_LastUpdate_TIME, F_Title, id, F_views FROM FreeBoard', (err, rows, fields) => {
        if (err) throw err;
        callback(rows);
    });
}

module.exports = {
    getList: queryList, 
    router: router
};

module.exports=router;

