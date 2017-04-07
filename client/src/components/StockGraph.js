import React from 'react';
import {
  Card,
  // CardActions,
  // CardHeader,
  CardMedia,
  // CardTitle,
  CardText,
} from 'material-ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import randomColor from 'randomcolor';

const SimpleLineChart = ({ stockData }) => {
  let formatedData = [];
  let lines;
  if (stockData.length) {
    stockData[0].data.forEach((day, index) => {
      formatedData.push({
        date: day.date,
      });
    });

    stockData.forEach(stock => {
      formatedData.forEach((day, index) => {
        formatedData[index][stock.stockID] = stock.data[index].price;
      });
    });
    lines = stockData.map(stock => {
      return (
        <Line
          key={stock.stockID}
          type="monotone"
          dataKey={stock.stockID}
          dot={false}
          stroke={randomColor({ luminosity: 'bright' })}
        />
      );
    });
  }

  return (
    <LineChart
      width={600}
      height={300}
      data={formatedData}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis dataKey="date" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      {lines}
    </LineChart>
  );
};

const StockGraph = ({ stockData }) => {
  return (
    <div id="graph-container">
      <Card>
        <CardText>
          <i className="fa fa-line-chart" aria-hidden="true" />
          US Stock Market
        </CardText>
        <CardMedia>
          <SimpleLineChart stockData={stockData} />
        </CardMedia>
      </Card>
    </div>
  );
};

export default StockGraph;
