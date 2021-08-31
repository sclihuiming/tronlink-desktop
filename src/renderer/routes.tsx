import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Hello from './views/Hello';
import Home from './views/Home';

export default function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hello" component={Hello} />
    </Switch>
  );
}
