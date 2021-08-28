import React from 'react';
import { render } from 'react-dom';
import App from './App';
import { renderEvents } from '../MessageDuplex';

renderEvents.bindEvents();

render(<App />, document.getElementById('root'));
