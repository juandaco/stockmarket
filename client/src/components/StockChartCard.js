import React from 'react';
import { CircularProgress } from 'material-ui';
import { Card, CardMedia, CardTitle } from 'material-ui/Card';
import StockChart from './StockChart';

const StockChartCard = ({ stockData }) => {
  return (
    <Card id="graph-container">
      <CardTitle style={{ fontSize: 28 }}>
        <i
          className="fa fa-line-chart"
          aria-hidden="true"
          style={{
            marginRight: 10,
            fontSize: 45,
          }}
        />
        US Stock Market
      </CardTitle>
      <CardMedia
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {stockData.length
          ? <StockChart stockData={stockData} />
          : <CircularProgress
              size={60}
              thickness={4}
              innerStyle={{ marginTop: 150 }}
            />}
      </CardMedia>
    </Card>
  );
};

export default StockChartCard;
