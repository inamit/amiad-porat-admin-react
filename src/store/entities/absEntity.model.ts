import { EntityState } from '@reduxjs/toolkit';
import { LoadStatus } from 'store/loadStatus';

export interface AbsEntityModel<T> {
  entitiesState: EntityState<T>;
  status: LoadStatus;
}
