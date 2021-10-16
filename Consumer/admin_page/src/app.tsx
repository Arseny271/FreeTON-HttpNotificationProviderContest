import React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import { PageAuth } from "./pages/auth";
import { PageAdmin } from "./pages/admin";

const App = () => {
  return <React.Fragment>
    <BrowserRouter>
      <Switch>
        <Route path = "/auth"   component = { PageAuth }/>
        <Route path = "/admin"  component = { PageAdmin }/>
        <Redirect from = "/" to = "/auth"/>
      </Switch>
    </BrowserRouter>
  </React.Fragment>
}

export { App }
