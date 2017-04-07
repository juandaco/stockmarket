import React, { Component } from 'react';
// Material-UI config
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { TextField, FlatButton, Chip } from 'material-ui';
// Material-UI Icons

// My Components
import StockGraph from './components/StockGraph';

// Create a new WebSocket.
let socket = new WebSocket(`ws://${window.location.hostname}:4000`);

class App extends Component {
  constructor() {
    super();
    this.state = {
      stocks: [],
      stockInput: '',
    };
    // Function bindings
    this.handleInputChange = this.handleInputChange.bind(this);
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
    this.setState({
      stocks: allStocks,
    });
  }

  setNewStock(newStock) {
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

  handleInputChange(e) {
    e.preventDefault();
    this.setState({
      stockInput: e.target.value.toUpperCase(),
    });
  }

  handleInputKeyDown(e) {
    switch (e.keyCode) {
      case 13: // Enter
        this.addNewStock();
        e.target.blur();
        break;
      case 27: //Esc
        this.setState({
          stockInput: '',
        });
        break;
      default:
    }
  }

  addNewStock() {
    if (this.state.stockInput) {
      this.setState({
        stockInput: '',
      });
      const stockList = this.state.stocks.map(stock => stock.stockID);
      if (!stockList.includes(this.state.stockInput)) {
        socket.send(
          JSON.stringify({
            stockID: this.state.stockInput,
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
              value={this.state.stockInput}
              onChange={this.handleInputChange}
              onKeyDown={this.handleInputKeyDown}
            />
            <FlatButton label="Add" onTouchTap={this.addNewStock} style={{minWidth: 50}}/>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
