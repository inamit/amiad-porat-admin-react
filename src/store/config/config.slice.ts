import {
  createSlice,
  createAsyncThunk,
  ActionReducerMapBuilder,
  AsyncThunk,
  createSelector
} from '@reduxjs/toolkit';
import { getGrades, getRooms, getSubjects } from 'dal/config.dal';
import { LoadStatus } from 'store/loadStatus';
import { RootState } from 'store/store';
import { ConfigModel, initialState } from './config.model';

export const fetchConfig = () => (dispatch) => {
  dispatch(fetchGrades());
  dispatch(fetchSubjects());
  dispatch(fetchRooms());
};
const fetchGrades = createAsyncThunk('config/fetchGrades', () => getGrades());
const fetchSubjects = createAsyncThunk('config/fetchSubjects', () =>
  getSubjects()
);
const fetchRooms = createAsyncThunk('config/fetchRooms', () => getRooms());

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    addCases(builder, fetchGrades, 'grades');
    addCases(builder, fetchSubjects, 'subjects');
    addCases(builder, fetchRooms, 'rooms');
  }
});

const addCases = (
  builder: ActionReducerMapBuilder<ConfigModel>,
  action: AsyncThunk<{ label: string; value: any }[], void, {}>,
  stateKey: string
) => {
  builder
    .addCase(action.pending, (state) => {
      state[stateKey].status = LoadStatus.LOADING;
    })
    .addCase(action.fulfilled, (state, action) => {
      state[stateKey].status = LoadStatus.IDLE;
      state[stateKey].values = action.payload;
    })
    .addCase(action.rejected, (state) => {
      state[stateKey].status = LoadStatus.FAILED;
    });
};

export const selectGrades = (state: RootState) => state.config.grades.values;
export const selectSubjects = (state: RootState) =>
  state.config.subjects.values;
export const selectRooms = (state: RootState) => state.config.rooms.values;
export const selectRoomsForScheduler = createSelector(selectRooms, (rooms) => [
  ...rooms.map((room) => ({
    id: room.value,
    text: room.label
  })),
  { id: '', text: 'לא נבחר' }
]);

export default configSlice.reducer;
