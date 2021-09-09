import { createReducer, createAction } from '@reduxjs/toolkit';

export const setTest = createAction<string>('setTest');
export const setAccounts = createAction<[]>('setAccounts');
export const setSelectedAddress = createAction<string>('setSelectedAddress');

export const appReducer = createReducer(
  {
    test: 'test',
    accounts: [],
    selectedAddress: '',
  },
  (builder) => {
    builder.addCase(setTest, (state, action) => {
      state.test = action.payload;
    });
    builder.addCase(setAccounts, (state, action) => {
      console.log('setAccounts----', state, action);
      state.accounts = action.payload;
    });
    builder.addCase(setSelectedAddress, (state, action) => {
      console.log('setSelectedAddress----', state, action);
      state.selectedAddress = action.payload;
    });
  }
);
