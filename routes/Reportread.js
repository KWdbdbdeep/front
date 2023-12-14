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

router.get('/:Q_Board_Id',readData);
function readData(req,res,next){
    var Q_Board_Id = req.params.Q_Board_Id;
    increaseViews(Q_Board_Id, () => {
        // 게시물 조회 로직
    getData(Q_Board_Id, (row) => {
        console.log('1개 글 조회 결과 확인:', row);
            res.render('Reportread', { title: "글 조회", row: row[0] });
        });
    });
}

function getData(Q_Board_Id, callback) {
    pool.query('SELECT Q_Board_Id, Q_Title, id, Q_views, Q_MainText, Q_Image FROM ReportBoard WHERE Q_Board_Id = ?', Q_Board_Id, (err, rows, fields) => {
        if (err) throw err;
        callback(rows);
    });
}
function increaseViews(Q_Board_Id, callback) {
    pool.query('UPDATE ReportBoard SET Q_views = Q_views + 1 WHERE Q_Board_Id = ?', Q_Board_Id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating views');
        }
        callback();
    });
}

module.exports = router;
