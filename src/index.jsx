// Application entrypoint.

// Load up the application styles
require("../styles/application.scss");

// Render the top-level React component
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App2.js';
import 'bootstrap/dist/css/bootstrap.css';
import style from '../styles/home.scss'

ReactDOM.render(<App />, document.getElementById('react-root'));
