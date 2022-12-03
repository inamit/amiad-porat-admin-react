import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import configReducer from './config/config.slice';
import { groupsMiddleware } from './groups/groups.effects';
import { groupsReducer } from './groups/groups.slice';
import { lessonsMiddleware } from './lessons/lessons.effects';
import { lessonsReducer } from './lessons/lessons.slice';
import { usersMiddleware } from './users/users.effects';
import { usersReducer } from './users/users.slice';

export const store = configureStore({
  reducer: {
    config: configReducer,
    groups: groupsReducer,
    lessons: lessonsReducer,
    users: usersReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      groupsMiddleware.middleware,
      lessonsMiddleware.middleware,
      usersMiddleware.middleware
    ),
  devTools: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
