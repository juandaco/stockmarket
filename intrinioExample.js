require('dotenv').config();
const intrinio = require('intrinio-client')(
  process.env.INTRINIO_USERNAME,
  process.env.INTRINIO_PASSWORD
);

intrinio.prices('AAPL')
.on('complete', function(data, response) {
  // console.log(response);
  console.log(data);
});

