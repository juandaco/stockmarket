import React, { Component } from 'react';
// Material-UI config
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { TextField, FlatButton, Chip } from 'material-ui';

// Colors
import rndMuiColor from './colorSetup';

// My Components
import StockGraph from './components/StockGraph';

// Create a new WebSocket.
let socket = new WebSocket(`ws://${window.location.hostname}`);

class App extends Component {
  constructor() {
    super();
    this.state = {
      stocks: [],
    };
    // Function bindings
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.setAllStocks = this.setAllStocks.bind(this);
    this.setNewStock = this.setNewStock.bind(this);
    this.setDeletedStock = this.setDeletedStock.bind(this);
    this.addNewStock = this.addNewStock.bind(this);
    this.removeStock = this.removeStock.bind(this);
    this.notFoundMessage = this.notFoundMessage.bind(this);
    this.setupStockCards = this.setupChips.bind(this);
  }

  componentDidMount() {
    // Handle any errors that occur.
    socket.onerror = err => {
      console.log('WebSocket Error: ' + err);
    };
    // Show a connected message when the WebSocket is opened.
    socket.onopen = e => {
      // socket.send('This is my message try');
    };
    // Handle messages sent by the server.
    socket.onmessage = e => {
      const message = JSON.parse(e.data);
      switch (message.dataInfo) {
        case 'SET_ALL_STOCKS':
          this.setAllStocks(message.allStocks);
          break;
        case 'SET_NEW_STOCK':
          this.setNewStock(message.newStock);
          break;
        case 'SET_DELETED_STOCK':
          this.setDeletedStock(message.stockID);
          break;
        case 'NOT_FOUND':
          this.notFoundMessage();
          break;
        default:
          console.log('Not a valid message');
      }
    };
    // Show a disconnected message when the WebSocket is closed.
    socket.onclose = e => {
      console.log('Disconnected from WebSocket.');
    };
  }

  setAllStocks(allStocks) {
    allStocks.forEach(stock => {
      stock['color'] = rndMuiColor.getColor();
      return stock;
    });
    this.setState({
      stocks: allStocks,
    });
  }

  setNewStock(newStock) {
    newStock['color'] = rndMuiColor.getColor();
    let newData = this.state.stocks.slice();
    newData.push(newStock);
    this.setState({
      stocks: newData,
    });
  }

  setDeletedStock(stockID) {
    let newData = this.state.stocks.slice();
    const indexOfStock = newData.findIndex(stock => stock.stockID === stockID);
    newData.splice(indexOfStock, 1);
    this.setState({
      stocks: newData,
    });
  }

  handleInputKeyDown(e) {
    switch (e.keyCode) {
      case 13: // Enter
        this.addNewStock();
        e.target.blur();
        break;
      case 27: //Esc
        this.stockInput.input.value = '';
        break;
      default:
    }
  }

  addNewStock() {
    const inputValue = this.stockInput.input.value.toUpperCase();
    this.stockInput.input.value = '';
    if (inputValue) {
      const stockList = this.state.stocks.map(stock => stock.stockID);
      if (!stockList.includes()) {
        socket.send(
          JSON.stringify({
            stockID: inputValue,
            request: 'ADD_STOCK',
          }),
        );
      } else {
        console.log('You already have that stock in the chart');
      }
    }
  }

  removeStock(stockID) {
    socket.send(
      JSON.stringify({
        stockID,
        request: 'REMOVE_STOCK',
      }),
    );
  }

  notFoundMessage() {
    console.log('Stock not found');
  }

  setupChips() {
    return this.state.stocks.map(stock => {
      return (
        <Chip
          key={stock.stockID}
          id={`${stock.stockID}-chip`}
          className="stock-chip"
          backgroundColor={stock.color}
          style={{ color: 'white' }}
          onRequestDelete={() => this.removeStock(stock.stockID)}
        >
          {`${stock.name} (${stock.stockID})`}
        </Chip>
      );
    });
  }

  render() {
    const chips = this.setupChips();
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div id="app-container">
          <StockGraph stockData={this.state.stocks} />
          <div id="chips-container">
            {chips}
          </div>
          <div id="search-box">
            <TextField
              hintText="Add your Stock!!!"
              ref={stockInput => this.stockInput = stockInput}
              onKeyDown={this.handleInputKeyDown}
              inputStyle={{ textTransform: 'uppercase' }}
            />
            <FlatButton
              label="Add"
              onTouchTap={this.addNewStock}
              style={{ minWidth: 50 }}
            />
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
