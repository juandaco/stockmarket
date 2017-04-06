require('dotenv').config();
const express = require('express');
const http = require('http');
const url = require('url');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const WebSocket = require('ws');

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
  Serve the Single Page App
*/
// app.use(express.static('public'));
// app.get('*', function(req, res) {
//   // Catches unknown adress and redirects to SPA
//   res.sendfile(__dirname + '/public/index.html');
// });

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws) {
  const location = url.parse(ws.upgradeReq.url, true);
  console.log(location);
  // You might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  ws.send('something');
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


server.listen(4000, function listening() {
  console.log('Listening on %d', server.address().port);
});
