import { FirestoreDataConverter } from "@firebase/firestore";

export default class Room {
  public id: string;
  public name: string;

  static empty() {
    return new Room("", "");
  }

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export const roomConverter: FirestoreDataConverter<Room> = {
  toFirestore: (room: Room) => {
    return { name: room.name };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return new Room(snapshot.id, data.name);
  },
};
