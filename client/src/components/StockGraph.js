import React from 'react';
import {
  Card,
  // CardActions,
  // CardHeader,
  CardMedia,
  CardTitle, // CardText,
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
import moment from 'moment';

const CustomizedAxisTick = ({ x, y, stroke, payload }) => {
  let formatedDate = moment(payload.value, 'ddd, MMM, D, YYYY').format(
    "MMM 'YY",
  );
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(-35)"
        style={{ fontSize: 14 }}
      >
        {formatedDate}
      </text>
    </g>
  );
};

const dateFormater = date => {
  return moment(date, 'ddd, MMM, D, YYYY').format("MMM 'YY");
};

const percentFormat = number => {
  return `$${number}`;
};

const SimpleLineChart = ({ stockData }) => {
  let formatedData = [];
  let lines;
  if (stockData.length) {
    stockData[0].data.forEach((day, index) => {
      formatedData.push({
        date: moment(day.date).format('ddd, MMM D, YYYY'),
      });
    });

    stockData.forEach(stock => {
      formatedData.forEach((day, index) => {
        formatedData[index][stock.stockID] = Number(
          stock.data[index].price.toFixed(2),
        );
      });
    });
    lines = stockData.map(stock => {
      return (
        <Line
          key={stock.stockID}
          type="monotone"
          dataKey={stock.stockID}
          dot={false}
          stroke={stock.color}
          strokeWidth={2}
        />
      );
    });
  }

  return (
    <LineChart
      width={850}
      height={450}
      data={formatedData}
      margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
    >
      <XAxis
        dataKey="date"
        height={75}
        tickCount={11}
        tick={<CustomizedAxisTick />}
        tickFormatter={dateFormater}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        label="USD"
        orientation="right"
        tickFormatter={percentFormat}
      />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      {lines}
    </LineChart>
  );
};

const StockGraph = ({ stockData }) => {
  return (
    <Card id="graph-container">
      <CardTitle style={{ fontSize: 30 }}>
        <i
          className="fa fa-line-chart"
          aria-hidden="true"
          style={{ marginRight: 10 }}
        />
        US Stock Market
      </CardTitle>
      <CardMedia style={{ display: 'flex', justifyContent: 'center' }}>
        <SimpleLineChart stockData={stockData} />
      </CardMedia>
    </Card>
  );
};

export default StockGraph;