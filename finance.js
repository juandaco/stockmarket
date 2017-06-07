const yahooFinance = require('yahoo-finance');

yahooFinance
  .historical({
    symbols: ['AAPL', 'YHOO'],
    modules: ['price'],
  })
  .then(data => {
    console.log(data);
  });
