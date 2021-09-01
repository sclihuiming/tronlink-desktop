import React from 'react';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import Hello from './views/Hello';
import Home from './views/Home';

export default function Routes() {
  const match = useRouteMatch();
  console.log('Routes:', match);
  return (
    <Switch>
      <Route path={`${match.path}/hello`} component={Hello} />
      <Route path={match.path} component={Home} />
    </Switch>
  );
}
