import React from 'react';
import { CircularProgress } from 'material-ui';
import { Card, CardMedia, CardTitle } from 'material-ui/Card';
import StockChart from './StockChart';

const StockChartCard = ({ stockData }) => {
  let showChart = false;
  if (Array.isArray(stockData) && stockData.length > 0) showChart = true;
  return (
    <Card id="main-card">
      <CardTitle id="card-title">
        <i
          id="stock-icon-title"
          className="fa fa-line-chart"
          aria-hidden="true"
        />
        US Stock Market
        <a
          id="synt4rt-link"
          href="https://www.freecodecamp.com/juandaco"
          target="_blank"
        >
          by <span id="synt4rt-logo">Synt4rt</span>
        </a>
      </CardTitle>
      <CardMedia id="card-media">
        {showChart
          ? <StockChart stockData={stockData} />
          : <CircularProgress size={60} thickness={4} />}
      </CardMedia>
    </Card>
  );
};

export default StockChartCard;
