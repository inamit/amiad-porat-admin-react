import { createListenerMiddleware } from '@reduxjs/toolkit';
import { saveNewGroup, updateGroup as dbUpdateGroup } from 'dal/groups.dal';
import Swal from 'sweetalert2';
import { addGroup, createNewGroup, removeGroup } from './groups.slice';

export const groupsMiddleware = createListenerMiddleware();

groupsMiddleware.startListening({
  actionCreator: createNewGroup,
  effect: async (action, listenerApi) => {
    const createdGroup = await saveNewGroup(action.payload);
    listenerApi.dispatch(addGroup(createdGroup));
    Swal.fire({ title: 'השיעור נוסף', icon: 'success' });
  }
});

groupsMiddleware.startListening({
  actionCreator: removeGroup,
  effect: async (action) => {}
});
