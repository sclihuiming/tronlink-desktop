import { combineReducers } from '@reduxjs/toolkit';
import { appReducer } from './appReducer';

// export default {
//   app: appReducer,
// };

export default combineReducers({
  app: appReducer,
});
