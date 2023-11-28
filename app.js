var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var homeRouter = require('./routes/home');
var usersRouter = require('./routes/users');
var register = require('./routes/register');
var loginRouter = require('./routes/login');
var mypageRouter = require('./routes/mypage/mypage');
var logoutRouter = require('./routes/logout');
var myinfoRouter = require('./routes/mypage/myinfo');

var rentmapRouter = require('./routes/rent/rentmap');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 세션 미들웨어 구성
app.use(session({
  secret: 'dbproject2023', // 비밀 키 설정
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // HTTPS를 사용하지 않는 경우 false로 설정
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);
app.use('/users', usersRouter);
app.use('/register', register);
app.use('/login', loginRouter);
app.use('/mypage', mypageRouter);
app.use('/rentmap', rentmapRouter);

// /logout 경로에 대한 미들웨어 함수 정의
app.post('/logout', (req, res) => {
  // 로그아웃 로직을 구현합니다.
  req.session.destroy((err) => {
    if (err) {
      console.error("로그아웃 오류:", err);
      res.status(500).json({ message: "로그아웃 실패" });
    } else {
      res.status(200).json({ message: "로그아웃 성공" });
    }
  });
});
app.use('/myinfo', myinfoRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

