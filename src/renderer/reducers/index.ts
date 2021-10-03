import { combineReducers } from '@reduxjs/toolkit';
import { appReducer } from './appReducer';
import { dappReducer } from './dappReducer';

// export default {
//   app: appReducer,
// };

export default combineReducers({
  app: appReducer,
  dapp: dappReducer,
});
