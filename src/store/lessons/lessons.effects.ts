import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  createMultipleLessons,
  createNewLessonFromLessonObject
} from 'dal/lessons.dal';
import {
  addLesson,
  addLessons,
  createBulkLessons,
  createOrUpdateLesson,
  selectLessonById,
  updateLesson
} from './lessons.slice';

export const lessonsMiddleware = createListenerMiddleware();

lessonsMiddleware.startListening({
  actionCreator: createBulkLessons,
  effect: async (action, listenerApi) => {
    const lessons = await createMultipleLessons(action.payload);
    listenerApi.dispatch(addLessons(lessons));
  }
});

lessonsMiddleware.startListening({
  actionCreator: createOrUpdateLesson,
  effect: async (action, listenerApi) => {
    if (action.payload.id) {
      const lesson = selectLessonById(action.payload.id);
      action.payload.students = lesson.students;

      listenerApi.dispatch(updateLesson(action.payload));
    } else {
      const lesson = await createNewLessonFromLessonObject(action.payload);
      listenerApi.dispatch(addLesson(lesson));
    }
  }
});

// lessonsMiddleware.startListening({
//   actionCreator: removeGroup,
//   effect: async (action) => {}
// });
