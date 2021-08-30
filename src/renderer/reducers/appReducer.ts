import { createReducer, createAction } from '@reduxjs/toolkit';

export const setTest = createAction<string>('setTest');

export const appReducer = createReducer(
  {
    test: 'test',
  },
  (builder) => {
    builder.addCase(setTest, (state, action) => {
      state.test = action.payload;
    });
  }
);
