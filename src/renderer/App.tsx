import React from 'react';
import {
  MemoryRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import './App.global.css';
// import 'antd/dist/antd.css';
import Home from './views/Home';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" />
        <Route path="/home" component={Home} />
        <Redirect to="/home" />
      </Switch>
    </Router>
  );
}
