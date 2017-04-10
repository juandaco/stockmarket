import React, { Component } from 'react';
// Material-UI config
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { TextField, FlatButton, Chip, Dialog } from 'material-ui';

// Colors
import rndMuiColor from './colorSetup';

// My Components
import StockChartCard from './components/StockChartCard';

// Create a new WebSocket.
import io from 'socket.io-client';
const socket = io();

class App extends Component {
  constructor() {
    super();
    this.state = {
      dialogText: '',
      showDialog: false,
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
    this.setupChips = this.setupChips.bind(this);
    this.openDialog = this.openDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
  }

  componentDidMount() {
    socket.on('SET_ALL_STOCKS', data => {
      this.setAllStocks(data.allStocks);
    });
    socket.on('SET_NEW_STOCK', data => {
      this.setNewStock(data.newStock);
    });
    socket.on('SET_DELETED_STOCK', data => {
      this.setDeletedStock(data.stockID);
    });
    socket.on('NOT_FOUND', data => {
      this.notFoundMessage();
    });
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
      if (!stockList.includes(inputValue)) {
        socket.emit('ADD_STOCK', {
          stockID: inputValue,
        });
      } else {
        this.setState({
          dialogText: 'You already have that stock in the chart',
        });
        this.openDialog();
      }
    }
  }

  removeStock(stockID) {
    socket.emit('REMOVE_STOCK', { stockID });
  }

  notFoundMessage() {
    this.setState({
      dialogText: 'Stock not fond!!!',
    });
    this.openDialog();
  }

  openDialog() {
    this.setState({
      showDialog: true,
    });
  }

  closeDialog() {
    this.setState({
      showDialog: false,
    });
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
          <StockChartCard stockData={this.state.stocks} />
          <div id="chips-container">
            {chips}
          </div>
          <div id="search-box">
            <TextField
              hintText="Add your Stock!!!"
              ref={stockInput => this.stockInput = stockInput}
              onKeyDown={this.handleInputKeyDown}
              style={{width: 200}}
              inputStyle={{ textTransform: 'uppercase' }}
            />
            <FlatButton
              label="Add"
              onTouchTap={this.addNewStock}
              style={{ minWidth: 50 }}
            />
          </div>
          <Dialog
            id="dialog"
            actions={[<FlatButton label="OK" onTouchTap={this.closeDialog} />]}
            modal={false}
            open={this.state.showDialog}
            onRequestClose={this.closeDialog}
          >
            {this.state.dialogText}
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
