import {
  createAction,
  createAsyncThunk,
  createSelector,
  createSlice,
  EntityId,
  PayloadAction,
  Update
} from '@reduxjs/toolkit';
import {
  addStudentsToLesson as dbAddStudentsToLesson,
  loadLessonsBetween,
  updateLesson as dbUpdateLesson,
  changeStudentStatus as dbChangeStudentStatus,
  deleteLessonById as dbDeleteLessonById
} from 'dal/lessons.dal';
import { AppointmentType } from 'models/enums/appointmentType';
import StudentStatus from 'models/enums/studentStatus';
import Lesson from 'models/lesson';
import { LoadStatus } from 'store/loadStatus';
import { RootState, store } from 'store/store';
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

export const createOrUpdateLesson = createAction<Lesson>(
  'lessons/createOrUpdateLesson'
);

export const updateLesson = createAsyncThunk(
  'lessons/update',
  (lesson: Lesson, thunkApi) => dbUpdateLesson(lesson.id, lesson)
);

export const addStudentsToLesson = createAsyncThunk<
  Update<Lesson>,
  { lessonId: string; studentUids: string[] }
>('lessons/addStudent', ({ lessonId, studentUids }, thunkApi) =>
  dbAddStudentsToLesson(lessonId, studentUids)
);

export const changeStudentStatus = createAsyncThunk<
  Update<Lesson>,
  {
    lessonId: string;
    studentUid: string;
    oldStatus: StudentStatus;
    newStatus: StudentStatus;
  }
>(
  'lessons/changeStudentStatus',
  ({ lessonId, studentUid, oldStatus, newStatus }) =>
    dbChangeStudentStatus(lessonId, studentUid, oldStatus, newStatus)
);

export const deleteLessonById = createAsyncThunk<string, { lessonId: string }>(
  'lessons/delete',
  ({ lessonId }) => dbDeleteLessonById(lessonId)
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

    builder.addCase(updateLesson.fulfilled, (state, action) => {
      state.entitiesState = lessonsAdapter.updateOne(
        state.entitiesState,
        action.payload
      );
    });

    builder.addCase(addStudentsToLesson.fulfilled, (state, action) => {
      state.entitiesState = lessonsAdapter.updateOne(
        state.entitiesState,
        action.payload
      );
    });

    builder.addCase(changeStudentStatus.fulfilled, (state, action) => {
      state.entitiesState = lessonsAdapter.updateOne(
        state.entitiesState,
        action.payload
      );
    });

    builder.addCase(deleteLessonById.fulfilled, (state, action) => {
      state.entitiesState = lessonsAdapter.removeOne(
        state.entitiesState,
        action.payload
      );
    });
  }
});

export const { addLesson, addLessons, removeLesson } = lessonsSlice.actions;
export const selectLessons = lessonsAdapter.getSelectors(
  (state: RootState) => state.lessons.entitiesState
).selectAll;
export const selectLessonById = (id: EntityId) =>
  lessonsAdapter
    .getSelectors((state: RootState) => state.lessons.entitiesState)
    .selectById(store.getState(), id);
export const selectLessonsForScheduler = createSelector(
  selectLessons,
  (lessons) =>
    lessons.map((lesson) => {
      return {
        id: lesson.id,
        startDate: lesson.start,
        endDate: lesson.end,
        tutorUid: lesson.tutor?.uid,
        roomId: lesson.room?.id,
        subject: lesson.subject,
        maxStudents: lesson.maxStudents,
        isOpen: lesson.isOpen,
        students: lesson.students,
        type: AppointmentType.LESSON
      };
    })
);
export const selectMinLessonsDate = (state: RootState) =>
  state.lessons.minLoadedDate;
export const selectMaxLessonsDate = (state: RootState) =>
  state.lessons.maxLoadedDate;

export const lessonsReducer = lessonsSlice.reducer;
