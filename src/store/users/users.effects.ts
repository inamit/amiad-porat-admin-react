import { createListenerMiddleware } from '@reduxjs/toolkit';
import { updateUser as dbUpdateUser } from 'dal/users.dal';
import { httpsCallable } from 'firebase/functions';
import { functions } from 'firebaseConfig';
import { EnumValue } from 'models/enums/enum';
import Swal from 'sweetalert2';
import { addUser, createNewUser, removeUser, updateUser } from './users.slice';

export const usersMiddleware = createListenerMiddleware();

usersMiddleware.startListening({
  actionCreator: createNewUser,
  effect: async (action, listenerApi) => {
    const createUser = httpsCallable(functions, 'createUser');

    const createdUser = await createUser(action.payload);
    listenerApi.dispatch(
      addUser({
        ...action.payload,
        uid: createdUser.data['uid'],
        role: action.payload.role as unknown as EnumValue<number>
      })
    );
    Swal.fire({ title: 'המשתמש נוסף', icon: 'success' });
  }
});

usersMiddleware.startListening({
  actionCreator: updateUser,
  effect: async (action) => {
    dbUpdateUser(action.payload.id.toString(), action.payload.changes);
  }
});

usersMiddleware.startListening({
  actionCreator: removeUser,
  effect: async (action) => {}
});
