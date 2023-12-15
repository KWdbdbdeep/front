
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
var manageRouter = require('./routes/manage/manage');
var userInfoRouter = require('./routes/manage/userInfo');
var rentmapRouter = require('./routes/rent/rentmap');
var Freeboard = require('./routes/Freeboard');
var Reportboard = require('./routes/Reportboard');
var userStatisticsRouter = require('./routes/userStatistics');
var Freewrite = require('./routes/Freewrite');
var Reportwrite = require('./routes/Reportwrite');
var Freeread = require('./routes/FreeRead');
var Reportread = require('./routes/ReportRead');
var Myboard = require('./routes/Myboard');
var Myrent = require('./routes/Myrent');

var updateUserInfoRouter = require('./routes/mypage/userInfoUpdateRouter');


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
app.use('/uploads', express.static('uploads'));

app.use('/', homeRouter);
app.use('/users', usersRouter);
app.use('/register', register);
app.use('/login', loginRouter);
app.use('/mypage', mypageRouter);
app.use('/rentmap', rentmapRouter);
app.use('/manage', manageRouter);
app.use('/manage/userInfo', userInfoRouter);
app.use('/logout', logoutRouter);
app.use('/Freeboard', Freeboard);
app.use('/Reportboard', Reportboard);
app.use('/api', userStatisticsRouter);
app.use('/Freewrite', Freewrite);
app.use('/Reportwrite', Reportwrite);
app.use('/Freeread', Freeread);
app.use('/Reportread', Reportread);
app.use('/Myboard', Myboard);
app.use('/Myrent', Myrent);

app.use(updateUserInfoRouter);

const updateUserRole = require('./public/viewscripts/userRole');

app.post('/changeRole', (req, res) => {
  const userId = req.body.id;
  const newRole = req.body.role;

  updateUserRole(userId, newRole)
    .then(message => res.send({ message }))
    .catch(error => res.status(500).send({ error }));
});
const updateUserStatus = require('./public/viewscripts/userStatus');

app.post('/changeStatus', (req, res) => {
  const userId = req.body.id;
  const newStatus = req.body.status;

  updateUserStatus(userId, newStatus)
    .then(message => res.send({ message }))
    .catch(error => res.status(500).send({ error }));
});

app.use('/myinfo', myinfoRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.error(err.stack); // 에러 스택 트레이스 로깅
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

