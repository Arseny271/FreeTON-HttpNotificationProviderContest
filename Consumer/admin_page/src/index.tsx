import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "mobx-react"

import { ConfigStore } from "./stores/config-store"
import { LanguageProvider } from "./utils/language-utils"
import { App } from './app';

import reportWebVitals from './reportWebVitals';
import "./index.css"

const stores = {
  configStore: new ConfigStore()
}

ReactDOM.render(
  <React.StrictMode>
    <Provider {...stores}>
      <LanguageProvider>
        <App/>
      </LanguageProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
