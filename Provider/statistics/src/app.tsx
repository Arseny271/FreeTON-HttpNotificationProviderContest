import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import { PageStat } from "./pages/stat";

const App = () => {
  return <React.Fragment>
    <BrowserRouter>
      <Switch>
        <Route path = "/"   component = { PageStat }/>
        <Redirect to = "/"/>
      </Switch>
    </BrowserRouter>
  </React.Fragment>
}

export { App }
