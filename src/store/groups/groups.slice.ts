import {
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction
} from '@reduxjs/toolkit';
import { AddGroupModel } from 'content/groups/AddGroup/addGroupModel';
import { getAllGroups } from 'dal/groups.dal';
import Group from 'models/group';
import { LoadStatus } from 'store/loadStatus';
import { RootState } from 'store/store';
import { groupsAdapter, initialState } from './groups.model';
import { updateGroup as dbUpdateGroup } from 'dal/groups.dal';

export const loadGroups = createAsyncThunk('groups/load', () => getAllGroups());

export const createNewGroup = createAction<AddGroupModel>(
  'groups/createNewGroup'
);

export const updateGroup = createAsyncThunk(
  'groups/update',
  (group: Group, thunkApi) => dbUpdateGroup(group.id, group)
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState: initialState,
  reducers: {
    addGroup: (state, action: PayloadAction<Group>) => {
      state.entitiesState = groupsAdapter.addOne(
        state.entitiesState,
        action.payload
      );
    },
    addGroups: (state, action: PayloadAction<Group[]>) => {
      state.entitiesState = groupsAdapter.addMany(
        state.entitiesState,
        action.payload
      );
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      state.entitiesState = groupsAdapter.removeOne(
        state.entitiesState,
        action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadGroups.pending, (state) => {
        state.status = LoadStatus.LOADING;
      })
      .addCase(loadGroups.fulfilled, (state, action) => {
        state.status = LoadStatus.IDLE;

        groupsSlice.caseReducers.addGroups(state, {
          payload: action.payload,
          type: 'addGroups'
        });
      })
      .addCase(loadGroups.rejected, (state) => {
        state.status = LoadStatus.FAILED;
      });

    builder.addCase(updateGroup.fulfilled, (state, action) => {
      state.entitiesState = groupsAdapter.updateOne(
        state.entitiesState,
        action.payload
      );
    });
  }
});

export const { addGroup, addGroups, removeGroup } = groupsSlice.actions;
export const selectGroups = groupsAdapter.getSelectors(
  (state: RootState) => state.groups.entitiesState
).selectAll;
export const selectGroupsLoadStatus = (state: RootState) => state.groups.status;
export const groupsReducer = groupsSlice.reducer;
