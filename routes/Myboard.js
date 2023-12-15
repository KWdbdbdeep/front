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

router.get('/', isAuthenticated, function (req, res, next) {
  res.redirect('/Myboard/myboard/1');
});

router.get('/Myboard/:idx', getListCallback);

function getListCallback(req, res, next) {
  queryList(req.session.userId, (rows) => {
    console.log('rows:' + JSON.stringify(rows));
    res.render('Myboard', { title: '내가 작성한 게시글 조회', rows: rows });
  });
}

function queryList(userId, callback) {
    const query = `
      SELECT 'free' as boardType, F_Board_Id as Board_Id, F_Title as Title, id, F_views as Views, F_MainText as MainText, F_Image as Image
      FROM FreeBoard
      WHERE id = ?;
    `;
  
    pool.query(query, [userId], (err, rows, fields) => {
      if (err) throw err;
      callback(rows);
    });
  }

function isAuthenticated(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  } else {
    res.redirect('/login');
  }
}

module.exports = {
  getList: queryList,
  router: router
};

module.exports = router;
