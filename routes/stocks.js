const express = require('express');
const stocksRouter = express.Router();


stocksRouter.get('/', function(req, res) {

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
