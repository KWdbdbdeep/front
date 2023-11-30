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
    res.render('Reportwrite', {title:"게시판 글쓰기"});
});
router.post('/', function(req, res){
    var Q_Title = req.body.title;
    var Q_MainText = req.body.content;
    var datas = [Q_Title, Q_MainText];
    insertdata(datas,()=>{
        res.redirect('/Reportboard');
    })
})

function insertdata(datas,callback){
    var sql = "INSERT INTO ReportBoard(Q_Title, Q_MainText) VALUES(?,?)";
    pool.query(sql, datas, function(err,rows){
        if (err) console.error("err:"+err);
        console.log("rows:"+JSON.stringify(rows));
        callback();
    })
    };


module.exports=router;

