import { getUserByID } from 'dal/users.dal';
import { DocumentData, FirestoreDataConverter } from 'firebase/firestore';
import User from './user';

export default class Group {
  public id: string;
  public name: string;
  public teacher: User | undefined;
  public subject: string;
  public day: number;
  public hour: string;

  static initAndFetch(
    id: string,
    name: string,
    teacher: string,
    subject: string,
    day: number,
    hour: string
  ) {
    const group = new Group(id, name, undefined, subject, day, hour);
    Group.loadTeacher(group, teacher);

    return group;
  }

  constructor(
    id: string,
    name: string,
    teacher: User | undefined,
    subject: string,
    day: number,
    hour: string
  ) {
    this.id = id;
    this.name = name;
    this.teacher = teacher;
    this.subject = subject;
    this.day = day;
    this.hour = hour;
  }

  private static async loadTeacher(group: Group, id: string) {
    group.teacher = await getUserByID(id);
  }
}

export const getGroupFromFirebaseDocumentData = (
  id: string,
  data: DocumentData
) => {
  return Group.initAndFetch(
    id,
    data.name,
    data.teacher,
    data.subject,
    data.dayInWeek,
    data.hour
  );
};

export const groupConverter: FirestoreDataConverter<Group> = {
  toFirestore: (group: Group) => {
    return {
      name: group.name,
      teacher: group.teacher?.uid
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return getGroupFromFirebaseDocumentData(snapshot.id, data);
  }
};
