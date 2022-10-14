import { createEntityAdapter, EntityState } from '@reduxjs/toolkit';
import Group from 'models/group';
import { AbsEntityModel } from 'store/entities/absEntity.model';
import { LoadStatus } from 'store/loadStatus';

export interface GroupsModel extends AbsEntityModel<Group> {}

export const groupsAdapter = createEntityAdapter<Group>({
  selectId: (group) => group.id
});

export const initialState: GroupsModel = {
  entitiesState: groupsAdapter.getInitialState(),
  status: LoadStatus.IDLE
};
