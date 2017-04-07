import React, { Component } from 'react';

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

  removeStock() {
    this.setState({
      stockInput: '',
    });
    socket.send(
      JSON.stringify({
        stockID: this.state.stockInput,
        request: 'REMOVE_STOCK',
      }),
    );
  }

  render() {
    return (
      <div className="App">
        <input
          type="text"
          value={this.state.stockInput}
          onChange={this.handleInputChange}
          onKeyDown={this.handleInputKeyDown}
        />
        <button onClick={this.addNewStock}>Add</button>
        <button onClick={this.removeStock}>Remove</button>
      </div>
    );
  }
}

export default App;
