require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const intrinio = require('intrinio-client')(
  process.env.INTRINIO_USERNAME,
  process.env.INTRINIO_PASSWORD
);

// Load Routes
const stocksRouter = require('./routes/stocks');

// Initialize Express App
const app = express();

/*
  Connect to the Database
*/
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.once('open', () => console.log('Connected to the Database'));

/*
  Configure Middleware
*/
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*
  User Routes
*/
app.use('/api/stocks', stocksRouter);

/*
  Serve the Single Page App
*/
app.use(express.static('public'));
app.get('*', function(req, res) {
  // Catches unknown adress and redirects to SPA
  res.sendfile(__dirname + '/public/index.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
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
