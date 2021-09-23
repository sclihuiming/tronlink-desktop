import React, { useEffect } from 'react';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { get } from 'lodash';
import './App.global.css';
import './App.global.scss';
// import 'antd/dist/antd.css';
import { RootState } from 'renderer/store';
import Home from './views/Home';
import Sign from './views/Sign';
import Login from './views/Login';

import enMessages from './lang/en-US.json';
import zhMessages from './lang/zh-CN.json';

const langs: { [propName: string]: any } = {
  'zh-CN': zhMessages,
  'en-US': enMessages,
};

function App(props: any) {
  const { lang } = props;
  const paramsStr = window.location.search;
  const params = new URLSearchParams(paramsStr);
  const isGotoSign = !!params.get('sign');
  const isGotoLogin = !get(props, 'isLogin', false);

  const isGotoHome = !isGotoLogin;
  return (
    <Router>
      <IntlProvider messages={langs[lang]} locale={lang} defaultLocale="zh-CN">
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/home" component={Home} />
          <Route path="/sign" component={Sign} />
          {isGotoLogin && <Redirect to="/login" />}
          {isGotoSign && <Redirect to="/sign" />}
          {isGotoHome && <Redirect to="/home" />}
        </Switch>
      </IntlProvider>
    </Router>
  );
}

export default connect((state: RootState, ownProps) => {
  return {
    isLogin: state.app.isLogin,
    lang: state.app.lang,
  };
})(App);
