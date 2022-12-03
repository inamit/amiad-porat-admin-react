import { FirestoreDataConverter } from '@firebase/firestore';

export default interface Room {
  id: string;
  name: string;
}

export const roomConverter: FirestoreDataConverter<Room> = {
  toFirestore: (room: Room) => {
    return { name: room.name };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return { id: snapshot.id, name: data.name };
  }
};
