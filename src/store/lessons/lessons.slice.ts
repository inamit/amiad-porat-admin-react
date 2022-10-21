import {
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  Update
} from '@reduxjs/toolkit';
import { loadLessonsBetween } from 'dal/lessons.dal';
import Lesson from 'models/lesson';
import { LoadStatus } from 'store/loadStatus';
import { RootState } from 'store/store';
import { initialState, lessonsAdapter } from './lessons.model';

export const loadLessons = createAsyncThunk<
  { lessons: Lesson[]; startDate: Date; endDate: Date },
  { startDate: Date; endDate: Date }
>('lessons/load', async ({ startDate, endDate }) => {
  return {
    lessons: await loadLessonsBetween([
      ['date', '>=', startDate],
      ['date', '<', endDate]
    ]),
    startDate,
    endDate
  };
});

export const createBulkLessons = createAction<Lesson[]>(
  'lessons/createBulkLessons'
);

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState: initialState,
  reducers: {
    addLesson: (state, action: PayloadAction<Lesson>) => {
      state.entitiesState = lessonsAdapter.addOne(
        state.entitiesState,
        action.payload
      );
    },
    addLessons: (state, action: PayloadAction<Lesson[]>) => {
      state.entitiesState = lessonsAdapter.addMany(
        state.entitiesState,
        action.payload
      );
    },
    updateLesson: (state, action: PayloadAction<Update<Lesson>>) => {
      state.entitiesState = lessonsAdapter.updateOne(
        state.entitiesState,
        action.payload
      );
    },
    removeLesson: (state, action: PayloadAction<string>) => {
      state.entitiesState = lessonsAdapter.removeOne(
        state.entitiesState,
        action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLessons.pending, (state) => {
        state.status = LoadStatus.LOADING;
      })
      .addCase(loadLessons.fulfilled, (state, action) => {
        state.status = LoadStatus.IDLE;
        if (
          state.minLoadedDate
            ? state.minLoadedDate > action.payload.startDate
            : true
        ) {
          state.minLoadedDate = action.payload.startDate;
        }
        if (
          state.maxLoadedDate
            ? state.maxLoadedDate < action.payload.endDate
            : true
        ) {
          state.maxLoadedDate = action.payload.endDate;
        }

        lessonsSlice.caseReducers.addLessons(state, {
          payload: action.payload.lessons,
          type: 'addLessons'
        });
      })
      .addCase(loadLessons.rejected, (state) => {
        state.status = LoadStatus.FAILED;
      });
  }
});

export const { addLesson, addLessons, updateLesson, removeLesson } =
  lessonsSlice.actions;
export const selectLessons = lessonsAdapter.getSelectors(
  (state: RootState) => state.lessons.entitiesState
).selectAll;
export const selectMinLessonsDate = (state: RootState) =>
  state.lessons.minLoadedDate;
export const selectMaxLessonsDate = (state: RootState) =>
  state.lessons.maxLoadedDate;

export const lessonsReducer = lessonsSlice.reducer;
