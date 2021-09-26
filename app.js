var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const passport = require('passport');

module.exports = (socket) => {

  // ROUTERS
  var signupRouter = require('./routes/signup');
  var loginRouter = require('./routes/login');
  var usersRouter = require('./routes/users');
  var questionsRouter = require('./routes/questions')(socket)
  var subjectsRouter = require('./routes/subjects')
  var threadsRouter = require('./routes/threads')(socket)
  var imagesRouter = require('./routes/images')

  var app = express();

  require('./auth/passport')(passport);

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(cors());

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/signup', signupRouter);
  app.use('/login', loginRouter);
  app.use('/users', usersRouter);
  app.use('/questions', questionsRouter);
  app.use('/subjects', subjectsRouter);
  app.use('/threads', threadsRouter);
  app.use('/files', imagesRouter);

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

  return app
}