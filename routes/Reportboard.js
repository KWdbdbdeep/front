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
    res.redirect('/reportboard/reportboard/1');
});
router.get('/reportboard/:idx', getListCallback);
function getListCallback(req, res, next) {
    queryList((rows) => {
        console.log('rows:' + JSON.stringify(rows));
        res.render('reportboard', { title: '게시판 조회', rows: rows });
    });
}

function queryList(callback) {
    pool.query('SELECT Q_Board_Id, Q_Title, id, Q_views FROM ReportBoard', (err, rows, fields) => {
        if (err) throw err;
        callback(rows);
    });
}

module.exports = {
    getList: queryList, 
    router: router
};

module.exports=router;

