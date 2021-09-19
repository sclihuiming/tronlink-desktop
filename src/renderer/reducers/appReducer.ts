import { createReducer, createAction } from '@reduxjs/toolkit';

export const setTest = createAction<string>('setTest');
export const setAccounts = createAction<[]>('setAccounts');
export const setSelectedAddress = createAction<string>('setSelectedAddress');
export const setLoginStatus = createAction<boolean>('setLoginStatus');
export const setNodeId = createAction<string>('setNodeId');

export const appReducer = createReducer(
  {
    test: 'test',
    accounts: [],
    selectedAddress: '',
    isLogin: false,
    nodeId: '',
  },
  (builder) => {
    builder.addCase(setTest, (state, action) => {
      state.test = action.payload;
    });
    builder.addCase(setAccounts, (state, action) => {
      state.accounts = action.payload;
    });
    builder.addCase(setSelectedAddress, (state, action) => {
      state.selectedAddress = action.payload;
    });
    builder.addCase(setLoginStatus, (state, action) => {
      state.isLogin = !!action.payload;
    });
    builder.addCase(setNodeId, (state, action) => {
      state.nodeId = action.payload;
    });
  }
);
