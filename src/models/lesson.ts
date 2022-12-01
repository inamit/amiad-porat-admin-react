import { FirestoreDataConverter } from 'firebase/firestore';
import StudentStatus from './enums/studentStatus';
import User from './user';

export default class Lesson {
  id: string;
  start: Date;
  end: Date;
  isOpen: boolean;
  tutor: { uid: string } | undefined;
  students: {
    student: { uid: string } | undefined;
    status: StudentStatus;
  }[];
  subject: string;
  room: { id: string } | undefined;
  maxStudents: number;
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

    return {
      id: snapshot.id,
      start: data.date.toDate(),
      end: new Date(data.date.toDate().getTime() + 60 * 60 * 1000),
      isOpen: data.isOpen,
      tutor: { uid: data.tutor },
      students: data.students.map((student) => {
        return { status: student.status, student: { uid: student.student } };
      }),
      subject: data.subject,
      room: { id: data.room },
      maxStudents: data.maxStudents
    };
  }
};
