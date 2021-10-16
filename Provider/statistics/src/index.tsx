import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "mobx-react"

import { LanguageProvider } from "./utils/language-utils"
import { App } from './app';

import reportWebVitals from './reportWebVitals';
import "./index.css"

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
