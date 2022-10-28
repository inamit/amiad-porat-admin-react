import { configureStore, createSelector } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import configReducer from './config/config.slice';
import { groupsMiddleware } from './groups/groups.effects';
import { groupsReducer, selectGroups } from './groups/groups.slice';
import { lessonsMiddleware } from './lessons/lessons.effects';
import { lessonsReducer, selectLessons } from './lessons/lessons.slice';
import { usersMiddleware } from './users/users.effects';
import { selectUsers, usersReducer } from './users/users.slice';

export const store = configureStore({
  reducer: {
    config: configReducer,
    groups: groupsReducer,
    lessons: lessonsReducer,
    users: usersReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      groupsMiddleware.middleware,
      lessonsMiddleware.middleware,
      usersMiddleware.middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const selectSchedule = createSelector(
  [selectGroups, selectLessons, selectUsers],
  (groups, lessons, users) => {
    const mappedGroups = groups.map((group) => {
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

      const groupTeacher = users.find(
        (tutor) => tutor.uid === group.teacher?.uid
      );

      return {
        text: group.name,
        allDay: false,
        startDate,
        endDate,
        recurrenceRule: 'INTERVAL=1;FREQ=WEEKLY',
        disabled: true,
        tutorUid: group.teacher?.uid,
        tutorName:
          `${groupTeacher?.firstName} ${groupTeacher?.lastName}` ?? 'לא נבחר',
        type: 'group'
      };
    });

    const mappedLessons = lessons.map((lesson) => {
      const lessonTutor = users.find((user) => user.uid === lesson.tutor?.uid);
      return {
        id: lesson.id,
        tutorName: `${
          `${lessonTutor.firstName} ${lessonTutor.lastName}` || 'לא נבחר'
        }`,
        startDate: lesson.start,
        endDate: lesson.end,
        tutorUid: lesson.tutor?.uid,
        roomId: lesson.room?.id,
        subject: lesson.subject,
        maxStudents: lesson.maxStudents,
        isOpen: lesson.isOpen,
        students: lesson.students,
        type: 'lesson'
      };
    });

    return [...mappedGroups, ...mappedLessons];
  }
);
