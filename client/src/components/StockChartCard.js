import React from 'react';
import { CircularProgress } from 'material-ui';
import { Card, CardMedia, CardTitle } from 'material-ui/Card';
import StockChart from './StockChart';

const StockChartCard = ({ stockData }) => {
  return (
    <Card id="main-card">
      <CardTitle id="card-title">
        <i
          id="stock-icon-title"
          className="fa fa-line-chart"
          aria-hidden="true"
        />
        US Stock Market
      </CardTitle>
      <CardMedia id="card-media">
        {stockData.length
          ? <StockChart stockData={stockData} />
          : <CircularProgress size={60} thickness={4} />}
      </CardMedia>
    </Card>
  );
};

export default StockChartCard;
