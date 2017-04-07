require('dotenv').config();
const express = require('express');
const http = require('http');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const WebSocket = require('ws');
const yahooFinance = require('yahoo-finance');
const util = require('util');
// console.log(util.inspect(snapshot, {showHidden: false, depth: 1}));

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

// Date Getting and Formating for later queries
let date = new Date();
const todayDate = date.toISOString().slice(0, 10);
date.setFullYear(date.getFullYear() - 1);
const startDate = date.toISOString().slice(0, 10);

/*
  WebSocket Setup
*/
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function(ws) {
  // On every openned connection send Stock Data
  Stocks.find({}, { _id: false }).lean().exec(function(err, stocks) {
    // 1. Get current stocks from Database
    // Format the Array returned from Mongo
    stocks = stocks.map(stock => stock.stockID);
    if (stocks.length) {
      yahooFinance.historical(
        {
          symbols: stocks,
          from: startDate,
          to: todayDate,
          period: 'd',
        },
        function(err, historyResults) {
          if (err) throw err;
          yahooFinance.snapshot(
            {
              symbols: stocks,
              fields: ['n'],
            },
            function(err, snapshots) {
              // Formatting Data
              let allStocks = Object.keys(historyResults).map(key => {
                historyResults[key] = historyResults[key].map(item => {
                  return {
                    date: item.date.toISOString().slice(0, 10),
                    price: item.close,
                  };
                });
                return {
                  stockID: key,
                  data: historyResults[key],
                };
              });
              // Adding name from the Snapshots
              allStocks = allStocks.map((stock, index) => {
                stock.name = snapshots[index].name;
                return stock;
              });
              // Send Data
              ws.send(
                JSON.stringify({
                  allStocks,
                  dataInfo: 'SET_ALL_STOCKS',
                })
              );
            }
          );
        }
      );
    }
  });

  // Respond to received messages
  ws.on('message', function(message) {
    const msg = JSON.parse(message);
    // Take action based on request
    if (msg.stockID) {
      switch (msg.request) {
        case 'ADD_STOCK':
          // 1. Search for stock in the API
          yahooFinance.historical(
            {
              symbol: msg.stockID,
              from: startDate,
              to: todayDate,
              period: 'd',
            },
            function(err, historyResult) {
              const exists = historyResult.length;
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
                  // Get Name
                  yahooFinance.snapshot(
                    {
                      symbol: msg.stockID,
                      fields: ['n'],
                    },
                    function(err, snapshot) {
                      // Format data
                      newMsg.data = historyResult.map(day => {
                        return {
                          date: day.date.toISOString().slice(0, 10),
                          price: day.close,
                        };
                      });
                      newMsg.name = snapshot.name;
                      // Send data
                      wss.clients.forEach(function each(client) {
                        if (client.readyState === WebSocket.OPEN) {
                          client.send(
                            JSON.stringify({
                              newStock: newMsg,
                              dataInfo: 'SET_NEW_STOCK',
                            })
                          );
                        }
                      });
                    }
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
            }
          );
          break;
        case 'REMOVE_STOCK':
          // REMOVE STOCK
          // Delete from the Database
          Stocks.deleteOne({ stockID: msg.stockID }, function(err, log) {
            if (err) throw err;
            // Send successful message for syncing
            wss.clients.forEach(function each(client) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    stockID: msg.stockID,
                    dataInfo: 'SET_DELETED_STOCK',
                  })
                );
              }
            });
          });
          break;
        default:
          console.log('Not a valid message');
          break;
      }
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
