import React from 'react';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import Routes from './routes';

export default function App() {
  return (
    <Router>
      <Switch>
        <Routes />
      </Switch>
    </Router>
  );
}
