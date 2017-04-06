const express = require('express');
const stocksRouter = express.Router();
const Stocks = require('../models/stocks');

stocksRouter.get('/', function(req, res) {
  // Send the current stocks
  // 1. Get current stocks from Database
  // 2. Intrinio API requests for each Stock 
  // 3. Return when the completed
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
