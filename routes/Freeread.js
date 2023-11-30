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

function readData(req,res, next){
    var idx = req.params.idx;
    getData(idx,(row)=>{
        console.log('1개 글 조회 결과 확인')
    })
}