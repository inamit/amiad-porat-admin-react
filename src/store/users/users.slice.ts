import {
  createAction,
  createAsyncThunk,
  createSlice,
  EntityId,
  PayloadAction,
  Update
} from '@reduxjs/toolkit';
import { AddUserForm } from 'content/users/AddUser/userFormModel';
import { getAllUsers } from 'dal/users.dal';
import User from 'models/user';
import { LoadStatus } from 'store/loadStatus';
import { RootState, store } from 'store/store';
import { initialState, usersAdapter } from './users.model';

export const loadUsers = createAsyncThunk('users/load', () => getAllUsers());

export const createNewUser = createAction<AddUserForm>('users/createNewUser');

const usersSlice = createSlice({
  name: 'users',
  initialState: initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.entitiesState = usersAdapter.addOne(
        state.entitiesState,
        action.payload
      );
    },
    addUsers: (state, action: PayloadAction<User[]>) => {
      state.entitiesState = usersAdapter.addMany(
        state.entitiesState,
        action.payload
      );
    },
    updateUser: (state, action: PayloadAction<Update<User>>) => {
      state.entitiesState = usersAdapter.updateOne(
        state.entitiesState,
        action.payload
      );
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.entitiesState = usersAdapter.removeOne(
        state.entitiesState,
        action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.status = LoadStatus.LOADING;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.status = LoadStatus.IDLE;

        usersSlice.caseReducers.addUsers(state, {
          payload: action.payload,
          type: 'addUsers'
        });
      })
      .addCase(loadUsers.rejected, (state) => {
        state.status = LoadStatus.FAILED;
      });
  }
});

export const { addUser, addUsers, updateUser, removeUser } = usersSlice.actions;
export const selectUsers = usersAdapter.getSelectors(
  (state: RootState) => state.users.entitiesState
).selectAll;
export const selectUserByUid = (id: EntityId) =>
  usersAdapter
    .getSelectors((state: RootState) => state.users.entitiesState)
    .selectById(store.getState(), id);
export const selectUsersLoadStatus = (state: RootState) => state.users.status;
export const usersReducer = usersSlice.reducer;
