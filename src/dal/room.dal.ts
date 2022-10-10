import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from 'firebaseConfig';
import Room, { roomConverter } from 'models/room';

export const roomsCollectioname = 'rooms';

export const getRoomById = async (id: string): Promise<Room | undefined> => {
  const room = await getDoc(
    doc(db, roomsCollectioname, id).withConverter(roomConverter)
  );

  return room.data();
};
