require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const yahooFinance = require('yahoo-finance');

/*
  Initialize Express App and Setup based on environment
*/
const app = express();
let server;
if (process.env.NODE_ENV === 'development') {
  const sslOptions = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
  };
  server = https.createServer(sslOptions, app);
} else if (process.env.NODE_ENV === 'production') {
  server = http.createServer(app);
}

/*
  Database Configuration
*/
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;
db.once('open', () => console.log('Connected to the Database'));
const Stocks = require('./models/stocks');

/*
  Configure Middleware
*/
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/*
  Serve the Single Page App in Production only
*/
if (process.env.NODE_ENV === 'production') {
  app.use(favicon(path.join(__dirname, 'client/build', 'favicon.ico')));
  app.use(express.static('./client/build'));
}

// Date Getting and Formating for API requests
let date = new Date();
const todayDate = date.toISOString().slice(0, 10);
date.setFullYear(date.getFullYear() - 1);
const startDate = date.toISOString().slice(0, 10);

/*
  WebSocket Setup
*/
const io = require('socket.io')(server);
io.on('connection', function(socket) {
  Stocks.find({}, { _id: false, __v: false })
    .lean()
    // 1. Get current stocks from Database
    .exec(function(err, stocks) {
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
                if (err) throw err;
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
                socket.emit('SET_ALL_STOCKS', { allStocks });
              }
            );
          }
        );
      }
    });

  socket.on('ADD_STOCK', function(data) {
    // 1. Search for stock in the API
    yahooFinance.historical(
      {
        symbol: data.stockID,
        from: startDate,
        to: todayDate,
        period: 'd',
      },
      function(err, historyResult) {
        const exists = historyResult.length;
        if (exists) {
          // Add to the Database
          let MyStock = new Stocks({
            stockID: data.stockID,
          });
          MyStock.save(function(err, resp) {
            if (err) throw err;
            let newMsg = {
              stockID: data.stockID,
            };
            // Get Name
            yahooFinance.snapshot(
              {
                symbol: data.stockID,
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
                io.emit('SET_NEW_STOCK', {
                  newStock: newMsg,
                });
              }
            );
          });
        } else {
          // Not found, send error message
          socket.emit('NOT_FOUND');
        }
      }
    );
  });
  socket.on('REMOVE_STOCK', function(data) {
    // Delete from the Database
    Stocks.deleteOne({ stockID: data.stockID }, function(err, log) {
      if (err) throw err;
      // Send successful message for syncing
      io.emit('SET_DELETED_STOCK', {
        stockID: data.stockID,
        dataInfo: 'SET_DELETED_STOCK',
      });
    });
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

const port = process.env.PORT || 4000;
server.listen(port, function listening() {
  console.log('Listening on %d', server.address().port);
});
