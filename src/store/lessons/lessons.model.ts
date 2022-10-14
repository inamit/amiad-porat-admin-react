import { createEntityAdapter } from '@reduxjs/toolkit';
import Lesson from 'models/lesson';
import { AbsEntityModel } from 'store/entities/absEntity.model';
import { LoadStatus } from 'store/loadStatus';

export interface LessonsModel extends AbsEntityModel<Lesson> {
  minLoadedDate: Date;
  maxLoadedDate: Date;
}

export const lessonsAdapter = createEntityAdapter<Lesson>({
  selectId: (lesson) => lesson.id,
  sortComparer: (a, b) => a.start.getTime() - b.start.getTime()
});

export const initialState: LessonsModel = {
  entitiesState: lessonsAdapter.getInitialState(),
  status: LoadStatus.IDLE,
  minLoadedDate: undefined,
  maxLoadedDate: undefined
};
