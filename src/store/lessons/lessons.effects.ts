import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  createMultipleLessons,
  createNewLessonFromLessonObject
} from 'dal/lessons.dal';
import {
  addLesson,
  addLessons,
  createBulkLessons,
  createOrUpdateLesson
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
      alert('update lesson ' + action.payload.id);
    } else {
      const lesson = await createNewLessonFromLessonObject(action.payload);
      listenerApi.dispatch(addLesson(lesson));
    }
  }
});

// lessonsMiddleware.startListening({
//   actionCreator: updateGroup,
//   effect: async (action) => {
//     dbUpdateGroup(action.payload.id.toString(), action.payload.changes);
//   }
// });

// lessonsMiddleware.startListening({
//   actionCreator: removeGroup,
//   effect: async (action) => {}
// });
