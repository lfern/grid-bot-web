
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var morgan = require('morgan');
var morganMiddleware = require('./middleware/morgan.winston');
var ejsLayouts = require("express-ejs-layouts");
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const {logger, captureConsoleLog} = require("./utils/logger");


captureConsoleLog();

require('./passport_setup')(passport);
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(flash());

// app.use(morgan('dev'));
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(ejsLayouts);
app.set('layout', './layouts/default')

app.use(session({secret: 'our new secret'}));
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter);
app.use('/users', usersRouter);


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
