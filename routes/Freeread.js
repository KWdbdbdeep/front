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

router.get('/:F_Board_Id',readData);
function readData(req,res,next){
    var F_Board_Id = req.params.F_Board_Id;
    increaseViews(F_Board_Id, () => {
        // 게시물 조회 로직
    getData(F_Board_Id, (row) => {
        console.log('1개 글 조회 결과 확인:', row);
            res.render('Freeread', { title: "글 조회", row: row[0] });
        });
    });
}

function getData(F_Board_Id, callback) {
    pool.query('SELECT F_Board_Id, F_Title, id, F_views, F_MainText, F_Image FROM FreeBoard WHERE F_Board_Id = ?', F_Board_Id, (err, rows, fields) => {
        if (err) throw err;
        callback(rows);
    });
}
function increaseViews(F_Board_Id, callback) {
    pool.query('UPDATE FreeBoard SET F_views = F_views + 1 WHERE F_Board_Id = ?', F_Board_Id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error updating views');
        }
        callback();
    });
}

module.exports = router;