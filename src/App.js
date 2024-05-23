import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';
import MapContainer from './MapContainer';

/*function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}*/
class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h2>Dynamic Routing and Scheduling App</h2>
        </div>
        <p className="App-intro">
          <MapContainer />
        </p>
      </div>
    );
  }
}

export default App;
