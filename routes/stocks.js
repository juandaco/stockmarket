const express = require('express');
const stocksRouter = express.Router();
const intrinio = require('intrinio-client')(
  process.env.INTRINIO_USERNAME,
  process.env.INTRINIO_PASSWORD
);
const Stocks = require('../models/stocks');

stocksRouter.get('/', function(req, res) {
  // 1. Get current stocks from Database
  Stocks.find({}, { _id: false }).lean().exec(function(err, stocks) {
    // 2. Intrinio API requests for each Stock
    let counter = 0;
    let finalResult = {};
    stocks.forEach(stock => {
      // Date Getting and Formating
      let date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      const startDate = date.toISOString().slice(0, 10);
      // The string is a hack to inlude a start_date
      const apiQuery = `${stock.stockID}&start_date=${startDate}`;
      intrinio.prices(apiQuery).on('complete', function(data, response) {
        // The map reduces the amount of information sent to the client
        finalResult[stock.stockID] = data.data.map(day => {
          let obj = {
            date: day.date,
            price: day.close  ,
          };
          return obj;
        });
        counter++;
        // 3. Return when the completed
        if (counter === stocks.length) {
          res.json(finalResult);
        }
      });
    });
  });
});

stocksRouter.post('/', function(req, res) {
  // Add a Stock
  // 1. Add the stockID to the Database found in req.body.stockID; // updateOne {upsert: true}
  // 2. Intrinio API requests for the Stock
  // 3. Return results
});

stocksRouter.delete('/', function(req, res) {
  // Remove the stockID found in req.body.stockID;
});

module.exports = stocksRouter;
