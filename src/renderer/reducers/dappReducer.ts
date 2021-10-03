import { createReducer, createAction } from '@reduxjs/toolkit';
import { DappData } from '../../types';

export const setDappList = createAction<DappData[]>('setDappList');

const defaultDappList: DappData[] = [];
export const dappReducer = createReducer(
  {
    dappList: defaultDappList,
  },
  (builder) => {
    builder.addCase(setDappList, (state, action) => {
      state.dappList = action.payload;
    });
  }
);
