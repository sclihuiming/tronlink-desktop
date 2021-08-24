import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Hello from './views/Hello';

export default function Routes() {
  return (
    <Switch>
      <Route path="/" component={Hello} />
    </Switch>
  );
}
