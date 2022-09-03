import {
  createSlice,
  createAsyncThunk,
  ActionReducerMapBuilder,
  AsyncThunk
} from '@reduxjs/toolkit';
import { getGrades, getSubjects } from 'dal/config.dal';
import { RootState } from 'store/store';
import { ConfigModel, initialState, LoadStatus } from './config.model';

export const fetchConfig = () => (dispatch) => {
  dispatch(fetchGrades());
  dispatch(fetchSubjects());
};
const fetchGrades = createAsyncThunk('config/fetchGrades', () => getGrades());
const fetchSubjects = createAsyncThunk('config/fetchSubjects', () =>
  getSubjects()
);

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    addCases(builder, fetchGrades, 'grades');
    addCases(builder, fetchSubjects, 'subjects');
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

export const selectGrades = (state: RootState) => state.config.grades;
export const selectSubjects = (state: RootState) => state.config.subjects;

export default configSlice.reducer;
