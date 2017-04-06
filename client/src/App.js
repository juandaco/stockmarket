import React, { Component } from 'react';

// Create a new WebSocket.
let socket = new WebSocket(`ws://${window.location.hostname}:4000`);

class App extends Component {
  componentDidMount() {
    // Handle any errors that occur.
    socket.onerror = function(error) {
      console.log(error);
      console.log('WebSocket Error: ' + error);
    };

    // Show a connected message when the WebSocket is opened.
    socket.onopen = function(event) {
      console.log('Connected to: ws://echo.websocket.org');
      socket.send('This is my message try');
    };

    // Handle messages sent by the server.
    socket.onmessage = function(event) {
      var message = event.data;
      console.log(message);
    };

    // Show a disconnected message when the WebSocket is closed.
    socket.onclose = function(event) {
      console.log('Disconnected from WebSocket.');
    };

  }

  render() {
    return (
      <div className="App">
        <button>Close </button>
      </div>
    );
  }
}

export default App;
