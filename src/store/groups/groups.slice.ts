import {
  createAction,
  createAsyncThunk,
  createSelector,
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
import { selectUsersGreaterThanRole } from 'store/users/users.slice';
import { UserRoles } from 'models/enums/userRoles';
import User from 'models/user';
import { AppointmentType } from 'models/enums/appointmentType';

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
export const selectGroupsWithTeachers = createSelector(
  selectGroups,
  selectUsersGreaterThanRole(UserRoles.TEACHER.value),
  (groups, teachers) => {
    return groups.map((group) => {
      const teacher: User = teachers.find((t) => t.uid === group.teacher?.uid);

      return {
        ...group,
        teacher: {
          uid: teacher?.uid,
          firstName: teacher?.firstName,
          lastName: teacher?.lastName
        }
      };
    });
  }
);
export const selectGroupsForScheduler = createSelector(
  selectGroupsWithTeachers,
  (groups) => {
    return groups.map((group) => {
      const today = new Date();

      let day = 0;

      if (today.getDay() === 7) {
        day = today.getDate() + group.day;
      } else if (group.day === 7) {
        day = today.getDate() - today.getDay();
      } else {
        day = today.getDate() - (today.getDay() - group.day);
      }
      const [hour, minutes] = group.hour.split(':');
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        day,
        parseInt(hour),
        parseInt(minutes)
      );
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      return {
        text: group.name,
        allDay: false,
        startDate,
        endDate,
        recurrenceRule: 'INTERVAL=1;FREQ=WEEKLY',
        disabled: true,
        tutorUid: group.teacher?.uid,
        subject: group.subject,
        type: AppointmentType.GROUP
      };
    });
  }
);
export const selectGroupsLoadStatus = (state: RootState) => state.groups.status;
export const groupsReducer = groupsSlice.reducer;
