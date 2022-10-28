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
        role: action.payload.role as unknown as EnumValue<number>,
        disabled: false
      })
    );
    Swal.fire({ title: 'המשתמש נוסף', icon: 'success' });
  }
});

usersMiddleware.startListening({
  actionCreator: updateUser,
  effect: async (action) => {
    try {
      await dbUpdateUser(action.payload.id.toString(), action.payload.changes);
      Swal.fire({ icon: 'success', title: 'עדכון המשתמש התבצע בהצלחה' });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'התרחשה שגיאה בעדכון המשתמש',
        text: e
      });
    }
  }
});

usersMiddleware.startListening({
  actionCreator: removeUser,
  effect: async (action) => {}
});
