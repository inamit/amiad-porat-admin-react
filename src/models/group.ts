import { getUserByID } from 'dal/users.dal';
import { DocumentData, FirestoreDataConverter } from 'firebase/firestore';
import User from './user';

export default interface Group {
  id: string;
  name: string;
  teacher: Partial<User>;
  subject: string;
  day: number;
  hour: string;
}

export const groupConverter: FirestoreDataConverter<Group> = {
  toFirestore: (group: Group) => {
    return {
      name: group.name,
      teacher: group.teacher?.uid,
      subject: group.subject,
      dayInWeek: group.day,
      hour: group.hour
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      name: data.name,
      teacher: { uid: data.teacher },
      subject: data.subject,
      day: data.dayInWeek,
      hour: data.hour
    };
  }
};
