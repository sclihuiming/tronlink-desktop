import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { AnyAction, configureStore, EnhancedStore } from '@reduxjs/toolkit';
import App from './App';
import { renderEvents } from '../MessageDuplex';
import store from './store';

class Entry {
  store: EnhancedStore<any, AnyAction, any[]>;

  constructor() {
    this.store = store;
  }

  start() {
    Entry.bindEvents();
    this.renderDom();
  }

  static bindEvents() {
    renderEvents.bindEvents();
  }

  renderDom() {
    render(
      <Provider store={this.store}>
        <App />
      </Provider>,
      document.getElementById('root')
    );
  }
}

const entry = new Entry();
entry.start();
