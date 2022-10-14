import { createEntityAdapter } from '@reduxjs/toolkit';
import User from 'models/user';
import { AbsEntityModel } from 'store/entities/absEntity.model';
import { LoadStatus } from 'store/loadStatus';

export interface UserModel extends AbsEntityModel<User> {}

export const usersAdapter = createEntityAdapter<User>({
  selectId: (user) => user.uid
});

export const initialState: UserModel = {
  entitiesState: usersAdapter.getInitialState(),
  status: LoadStatus.IDLE
};
