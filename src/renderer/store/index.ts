import { AnyAction, configureStore, EnhancedStore } from '@reduxjs/toolkit';
import reduxLogger from 'redux-logger';
import reducer from '../reducers';

const store = configureStore({
  middleware: [reduxLogger],
  reducer,
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
