import { createListenerMiddleware } from '@reduxjs/toolkit';
import {
  createMultipleLessons,
  createNewLessonFromLessonObject,
  updateLesson as dbUpdateLesson
} from 'dal/lessons.dal';
import {
  addLesson,
  addLessons,
  createBulkLessons,
  createOrUpdateLesson,
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
      const updatedLesson = await dbUpdateLesson(action.payload);
      listenerApi.dispatch(
        updateLesson({ id: action.payload.id, changes: updatedLesson })
      );
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
