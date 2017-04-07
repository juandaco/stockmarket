require('dotenv').config();
const express = require('express');
const http = require('http');
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
const Stocks = require('./models/stocks');

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

/*
  Intrinio API Setup
*/
const intrinio = require('intrinio-client')(
  process.env.INTRINIO_USERNAME,
  process.env.INTRINIO_PASSWORD
);
// Date Getting and Formating for later queries
let date = new Date();
date.setFullYear(date.getFullYear() - 1);
const startDate = date.toISOString().slice(0, 10);
// The string is a hack to inlude a start_date
const apiQuery = stockID => `${stockID}&start_date=${startDate}`;

/*
  WebSocket Setup
*/
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function(ws) {
  // On every openned connection send Stock Data
  Stocks.find({}, { _id: false }).lean().exec(function(err, stocks) {
    // 1. Get current stocks from Database
    let counter = 0;
    let allStocks = [];
    stocks.forEach(stock => {
      // 2. Intrinio API requests for each Stock
      intrinio
        .prices(apiQuery(stock.stockID))
        .on('complete', function(data, response) {
          // Only send relevant data
          stock['data'] = data.data.map(day => {
            return {
              date: day.date,
              price: day.close,
            };
          });
          allStocks.push(stock);
          counter++;
          if (counter === stocks.length) {
            // 3. Return when the all the API queries are completed
            ws.send(
              JSON.stringify({
                allStocks,
                dataInfo: 'SET_ALL_STOCKS',
              })
            );
          }
        });
    });
  });
  // Respond to received messages
  ws.on('message', function(message) {
    const msg = JSON.parse(message);
    // Take action based on request
    switch (msg.request) {
      case 'ADD_STOCK':
        // 1. Search for stock on Intrinio API
        intrinio
          .prices(apiQuery(msg.stockID))
          .on('complete', function(data, res) {
            const exists = data.data.length;
            // Found on Intrinio
            if (exists) {
              // Add to the Database
              let MyStock = new Stocks({
                stockID: msg.stockID,
              });
              MyStock.save(function(err, resp) {
                if (err) throw err;
                let newMsg = {
                  stockID: msg.stockID,
                };
                newMsg['data'] = data.data.map(day => {
                  return {
                    date: day.date,
                    price: day.close,
                  };
                });
                // Send data
                ws.send(
                  JSON.stringify({
                    newStock: newMsg,
                    dataInfo: 'SET_NEW_STOCK',
                  })
                );
              });
            } else {
              // Not found, send error message
              ws.send(
                JSON.stringify({
                  dataInfo: 'NOT_FOUND',
                })
              );
            }
          });
        break;
      case 'REMOVE_STOCK':
        // REMOVE STOCK
        // Delete from the Database
        Stocks.deleteOne({ stockID: msg.stockID }, function(err, log) {
          if (err) throw err;
          // Send successful message for syncing
          ws.send(
            JSON.stringify({
              stockID: msg.stockID,
              dataInfo: 'SET_DELETED_STOCK',
            })
          );
        });
        break;
      default:
        console.log('Not a valid message');
        break;
    }
  });
});

/*
  Error Handling
*/
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
  res.send('error');
});

server.listen(4000, function listening() {
  console.log('Listening on %d', server.address().port);
});
