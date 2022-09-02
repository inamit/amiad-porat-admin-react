import { AddGroupModel } from 'content/groups/AddGroup/addGroupModel';
import {
  getDocs,
  collection,
  addDoc,
  FirestoreError,
  DocumentReference,
  DocumentData,
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { EnumValue } from 'models/enums/enum';
import Group, { groupConverter } from 'models/group';

const groupsCollectionName = 'groups';

export const getAllGroups = async (): Promise<Group[]> => {
  const groups = await getDocs(
    collection(db, groupsCollectionName).withConverter(groupConverter)
  );

  return groups.docs.map((doc) => doc.data());
};

export const getGroupsForSelect = async (): Promise<EnumValue<string>[]> => {
  const groupsSnapshot = await getDocs(collection(db, groupsCollectionName));

  return groupsSnapshot.docs.map((doc) => ({
    value: doc.id,
    label: doc.get('name')
  }));
};

export const teacherHasGroupByDateTime = async (
  teacherId: string,
  dayInWeek: number,
  hour: string
): Promise<boolean> => {
  const groupQuery = query(
    collection(db, groupsCollectionName),
    where('teacher', '==', teacherId),
    where('dayInWeek', '==', dayInWeek),
    where('hour', '==', hour)
  );

  const docs = await getDocs(groupQuery);
  return !docs.empty;
};

export const updateGroupField = async (
  groupId: string,
  fieldName: string,
  newValue: any
): Promise<void> => {
  const groupRef = doc(db, groupsCollectionName, groupId);

  await updateDoc(groupRef, { [fieldName]: newValue });
};

export const createNewGroup = async (
  group: AddGroupModel
): Promise<DocumentReference<DocumentData>> => {
  try {
    const doc = await addDoc(collection(db, groupsCollectionName), {
      name: group.name,
      teacher: group.teacher,
      subject: group.subject,
      dayInWeek: group.dayInWeek,
      hour: `${group.hour.getHours()}:${group.hour
        .getMinutes()
        .toString()
        .padStart(2, '0')}`
    });

    return doc;
  } catch (error) {
    let message = '';

    if (error instanceof FirestoreError) {
      switch (error.code) {
        case 'permission-denied':
        case 'unauthenticated':
          message = 'אין לך הרשאה לבצע את הפעולה הזאת';
          break;
        default:
          message = 'קרתה תקלה. פנה לתמיכה';
          break;
      }
    }

    throw { message };
  }
};
