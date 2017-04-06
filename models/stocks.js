const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Stock = new Schema({
  stockID: {
    type: String,
    unique: true,
  }
});

module.exports = mongoose.model('Stock', Stock);
