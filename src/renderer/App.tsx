import React from 'react';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import './App.global.css';
import './App.global.scss';
// import 'antd/dist/antd.css';
import Home from './views/Home';
import Sign from './views/Sign';

export default function App() {
  const paramsStr = window.location.search;
  const params = new URLSearchParams(paramsStr);
  const isGotoSign = !!params.get('sign');
  const isGotoLogin = false;
  const isGotoHome = true;
  // console.log('App', window.location)

  return (
    <Router>
      <Switch>
        <Route path="/login" />
        <Route path="/home" component={Home} />
        <Route path="/sign" component={Sign} />
        {isGotoSign && <Redirect to="/sign" />}
        {isGotoHome && <Redirect to="/home" />}
        {isGotoLogin && <Redirect to="/login" />}
        {!isGotoHome && !isGotoSign && !isGotoLogin && <Redirect to="/login" />}
      </Switch>
    </Router>
  );
}
