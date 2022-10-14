import { createListenerMiddleware } from '@reduxjs/toolkit';
import { createMultipleLessons } from 'dal/lessons.dal';
import { addLessons, createBulkLessons } from './lessons.slice';

export const lessonsMiddleware = createListenerMiddleware();

lessonsMiddleware.startListening({
  actionCreator: createBulkLessons,
  effect: async (action, listenerApi) => {
    const lessons = await createMultipleLessons(action.payload);
    listenerApi.dispatch(addLessons(lessons));
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
