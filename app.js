const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const FileStreamRotator = require('file-stream-rotator');
const fs = require('fs');
const env = require('./config/env');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const apiRouter = require('./routes/api');
const apiv1Router = require('./routes/apiv1');
const apiv2Router = require('./routes/apiv2');

const siteConfig = require('./config/site');

const app = express();

app.locals.__server = {
  token: ''
}
app.locals.title = siteConfig.title;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (env.isProduction) {
  app.use(helmet());
  const logDirectory = path.join(__dirname, 'logs');
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  const accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: path.join(logDirectory, 'access-%DATE%.log'),
    frequency: 'daily',
    verbose: false
  })
  app.use(logger('combined', {stream: accessLogStream}))
} else {
  app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/api/v1', apiv1Router);
app.use('/api/v2', apiv2Router);
app.use('/api', apiRouter);

app.use(express.static(path.join(__dirname, 'client/build')));
app.use('/static', express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
