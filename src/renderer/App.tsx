import React, { useEffect } from 'react';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { get } from 'lodash';
import './App.global.css';
import './App.global.scss';
// import 'antd/dist/antd.css';
import { RootState } from 'renderer/store';
import Home from './views/Home';
import Sign from './views/Sign';
import Login from './views/Login';

function App(props: any) {
  const paramsStr = window.location.search;
  const params = new URLSearchParams(paramsStr);
  const isGotoSign = !!params.get('sign');
  const isGotoLogin = !get(props, 'isLogin', false);

  const isGotoHome = !isGotoLogin;
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/home" component={Home} />
        <Route path="/sign" component={Sign} />
        {isGotoLogin && <Redirect to="/login" />}
        {isGotoSign && <Redirect to="/sign" />}
        {isGotoHome && <Redirect to="/home" />}
      </Switch>
    </Router>
  );
}

export default connect((state: RootState, ownProps) => {
  return {
    isLogin: state.app.isLogin,
  };
})(App);
