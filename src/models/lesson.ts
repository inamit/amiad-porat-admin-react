import { getUsersByMultipleIDs } from 'dal/users.dal';
import { FirestoreDataConverter } from 'firebase/firestore';
import StudentStatus from './enums/studentStatus';
import Room from './room';
import User from './user';

export default class Lesson {
  public id: string;
  public start: Date;
  public end: Date;
  public isOpen: boolean;
  public tutor: Partial<User> | undefined;
  public students: {
    student: Partial<User> | undefined;
    status: StudentStatus;
  }[];
  public subject: string;
  public room: Partial<Room> | undefined;
  public maxStudents: number;

  name = 'תגבור';

  static empty(): Lesson {
    return new Lesson(
      '',
      new Date(),
      false,
      User.empty(),
      [],
      '',
      Room.empty(),
      0
    );
  }

  static initAndFetch(
    id: string,
    date: Date,
    isOpen: boolean,
    tutor: string,
    students: { student: string; status: StudentStatus }[],
    subject: string,
    room: string,
    maxStudents: number
  ): Lesson {
    const lesson = new Lesson(
      id,
      date,
      isOpen,
      { uid: tutor },
      students.map((values) => ({
        student: { uid: values.student },
        status: values.status
      })),
      subject,
      { id: room },
      maxStudents
    );
    // Lesson.loadStudents(lesson, students);

    return lesson;
  }

  constructor(
    id: string,
    date: Date,
    isOpen: boolean,
    tutor: Partial<User> | undefined,
    students: { student: Partial<User>; status: StudentStatus }[],
    subject: string,
    room: Partial<Room> | undefined,
    maxStudents: number
  ) {
    this.id = id;
    this.start = date;
    this.isOpen = isOpen;
    this.subject = subject;
    this.end = new Date(date.getTime() + 60 * 60 * 1000);
    this.students = students;
    this.tutor = tutor;
    this.room = room;
    this.maxStudents = maxStudents;
  }

  // private static async loadStudents(
  //   lesson: Lesson,
  //   students: { student: string; status: StudentStatus }[]
  // ) {
  //   if (students.length > 0) {
  //     const studentsMapped = await getUsersByMultipleIDs(
  //       students.map((value) => value.student)
  //     );

  //     lesson.students.push(
  //       ...students.map((value) => {
  //         return {
  //           student: studentsMapped.find(
  //             (student) => student.uid === value.student
  //           ),
  //           status: value.status
  //         };
  //       })
  //     );
  //   }
  // }
}

export const isStudentInLesson = (
  students: { student: Partial<User> | undefined; status: StudentStatus }[],
  studentId: string
): boolean => {
  return Boolean(
    students.find(
      (value) =>
        value.status === StudentStatus.Scheduled &&
        value.student?.uid === studentId
    )
  );
};

export const lessonConverter: FirestoreDataConverter<Lesson> = {
  toFirestore: (lesson: Lesson) => {
    return {
      date: lesson.start,
      isOpen: lesson.isOpen,
      tutor: lesson.tutor.uid,
      students: lesson.students.map((value) => ({
        student: value.student.uid,
        status: value.status
      })),
      subject: lesson.subject,
      room: lesson.room.id,
      maxStudents: lesson.maxStudents
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return Lesson.initAndFetch(
      snapshot.id,
      data.date.toDate(),
      data.isOpen,
      data.tutor,
      data.students,
      data.subject,
      data.room,
      data.maxStudents
    );
  }
};
