import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { AnyAction, configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { get } from 'lodash';
import { IntlProvider } from 'react-intl';
import App from './App';
import * as renderEvents from '../MessageDuplex/events/renderEvents';
import * as renderApi from '../MessageDuplex/handlers/renderApi';
import {
  setAccounts,
  setSelectedAddress,
  setLoginStatus,
  setNodeId,
} from './reducers/appReducer';
import { setDappList } from './reducers/dappReducer';
import store from './store';

import enMessages from './lang/en-US.json';
import zhMessages from './lang/zh-CN.json';

class Entry {
  store: EnhancedStore<any, AnyAction, any[]>;

  lang: { [propName: string]: any };

  constructor() {
    this.store = store;
    this.lang = {
      'zh-CN': zhMessages,
      'en-US': enMessages,
    };
  }

  async start() {
    Entry.bindEvents();
    await this.getAppState();
    this.renderDom();
  }

  static bindEvents() {
    renderEvents.bindEvents();
  }

  async getAppState() {
    const [accountsRes, selectedRes, loginRes, nodeIdRes] = await Promise.all([
      renderApi.getAccounts(),
      renderApi.getSelectedAddress(),
      renderApi.isLogin(),
      renderApi.getNodeId(),
    ]);

    this.store.dispatch(setAccounts(get(accountsRes, 'data', [])));
    this.store.dispatch(setSelectedAddress(get(selectedRes, 'data', '')));
    this.store.dispatch(setLoginStatus(get(loginRes, 'data', false)));
    this.store.dispatch(setNodeId(get(nodeIdRes, 'data', '')));

    renderApi.getDappList()?.then((res) => {
      return this.store.dispatch(setDappList(get(res, 'data', [])));
    });
    // return this.store;
  }

  renderDom() {
    render(
      <Provider store={this.store}>
        <IntlProvider
          messages={this.lang['zh-CN']}
          locale="zh-CN"
          defaultLocale="zh-CN"
        >
          <App />
        </IntlProvider>
      </Provider>,
      document.getElementById('root')
    );
  }
}

const entry = new Entry();
entry.start();
