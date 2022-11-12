import { Update } from '@reduxjs/toolkit';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from 'firebaseConfig';
import StudentStatus from 'models/enums/studentStatus';
import Lesson, { lessonConverter } from 'models/lesson';

const lessonsCollectionName = 'lessons';

export const isTutorAvailable = async (
  lessonDate: Date,
  tutorUID: string,
  excludedLessons?: string[]
) => {
  if (tutorUID) {
    const endDate = new Date(lessonDate);
    endDate.setHours(endDate.getHours() + 1);

    const queryConstraints = [
      where('date', '>=', lessonDate),
      where('date', '<', endDate),
      where('tutor', '==', tutorUID)
    ];

    let existingLessons = (
      await getDocs(
        query(collection(db, lessonsCollectionName), ...queryConstraints)
      )
    ).docs;

    if (excludedLessons) {
      existingLessons = existingLessons.filter(
        (lesson) => !excludedLessons.includes(lesson.id)
      );
    }

    return existingLessons.length === 0;
  }

  return true;
};

export const isRoomAvailable = async (
  lessonDate: Date,
  roomId: string,
  excludedLessons?: string[]
) => {
  if (roomId) {
    const endDate = new Date(lessonDate);
    endDate.setHours(endDate.getHours() + 1);
    const queryConstraints = [
      where('date', '>=', lessonDate),
      where('date', '<', endDate),
      where('room', '==', roomId)
    ];

    let existingLessons = (
      await getDocs(
        query(collection(db, lessonsCollectionName), ...queryConstraints)
      )
    ).docs;

    if (excludedLessons) {
      existingLessons = existingLessons.filter(
        (lesson) => !excludedLessons.includes(lesson.id)
      );
    }

    return existingLessons.length === 0;
  }

  return true;
};

export const createNewLessonFromLessonObject = async (
  lesson: Lesson
): Promise<Lesson> => {
  const doc = await addDoc(
    collection(db, lessonsCollectionName).withConverter(lessonConverter),
    lesson
  );

  return (await getDoc(doc.withConverter(lessonConverter))).data();
};

export const createMultipleLessons = async (lessons: Lesson[]) => {
  return Promise.all(
    lessons.map((lesson) => createNewLessonFromLessonObject(lesson))
  );
};

export const loadLessonsBetween = async (
  filters: [string, WhereFilterOp, Date][]
): Promise<Lesson[]> => {
  const constraints = filters.map(([field, operation, value]) =>
    where('date', operation, value)
  );

  const lessonsQuery = query(
    collection(db, lessonsCollectionName),
    ...constraints
  );

  const lessons = await getDocs(lessonsQuery.withConverter(lessonConverter));

  const lessonsArr = lessons.docs.map((lesson) => lesson.data());

  return lessonsArr;
};

export const updateLesson = async (
  id: string,
  updatedLesson: Partial<Lesson>
) => {
  const lessonRef = doc(db, lessonsCollectionName, id).withConverter(
    lessonConverter
  );

  await setDoc(lessonRef, updatedLesson);
  return { id, changes: updatedLesson };
};

export const addStudentsToLesson = async (
  lessonId: string,
  studentsUid: string[]
): Promise<Update<Lesson>> => {
  const lessonToAdd = doc(db, lessonsCollectionName, lessonId);

  const studentsToAdd = studentsUid.map((studentId) => {
    return { student: studentId, status: StudentStatus.Scheduled };
  });

  await updateDoc(lessonToAdd, { students: arrayUnion(...studentsToAdd) });

  const updatedLesson = await (
    await getDoc(lessonToAdd.withConverter(lessonConverter))
  ).data();

  return { id: lessonId, changes: updatedLesson };
};

export const changeStudentStatus = async (
  lessonId: string,
  studentId: string,
  oldStatus: StudentStatus,
  newStatus: string
): Promise<Update<Lesson>> => {
  const lesson = doc(db, lessonsCollectionName, lessonId).withConverter(
    lessonConverter
  );

  await updateDoc(lesson, {
    students: arrayRemove({ student: studentId, status: oldStatus })
  });

  await updateDoc(lesson, {
    students: arrayUnion({ student: studentId, status: newStatus })
  });

  const updatedLesson = (await getDoc(lesson)).data();
  return { id: lessonId, changes: updatedLesson };
};

export const deleteLessonById = async (lessonId: string) => {
  await deleteDoc(doc(db, lessonsCollectionName, lessonId));
};

export const getLessonsToOpen = async (
  startDate: Date,
  endDate: Date,
  subject: string
) => {
  const lessonsQuery = query(
    collection(db, lessonsCollectionName),
    where('date', '>=', startDate),
    where('date', '<', endDate),
    where('subject', '==', subject),
    where('isOpen', '==', false)
  );

  const lessons = await getDocs(lessonsQuery.withConverter(lessonConverter));

  const lessonsArr = lessons.docs.map((lesson) => lesson.data());

  const lessonsToOpen = (await lessonsArr).filter(
    (lesson) =>
      lesson.students.filter(
        (value) => value.status === StudentStatus.Scheduled
      ).length < lesson.maxStudents
  );

  return lessonsToOpen;
};

export const getScheduledStudentsUidBetween = async (
  start: Date,
  end: Date
): Promise<string[]> => {
  const lessonsQuery = query(
    collection(db, lessonsCollectionName),
    where('date', '>=', start),
    where('date', '<=', end)
  );

  const lessons = await getDocs(lessonsQuery.withConverter(lessonConverter));

  const lessonsArr = lessons.docs
    .map((lesson) =>
      lesson
        .data()
        .students.filter((value) => value.status === StudentStatus.Scheduled)
        .map((student) => student.student?.uid)
    )
    .reduce((acc, uidArr) => [...acc, ...uidArr], []);

  return lessonsArr;
};
