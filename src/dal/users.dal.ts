import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  where,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from 'firebaseConfig';
import { EnumValue } from 'models/enums/enum';
import User, { userConverter } from 'models/user';

const usersCollectionName = 'users';

export const getUserByID = async (id: string): Promise<User | undefined> => {
  const userDoc = doc(db, usersCollectionName, id);
  const snapshot = await getDoc(userDoc.withConverter(userConverter));

  return snapshot.data();
};

export const getUsersWithRoleBiggerThan = async (
  minRole: EnumValue<number>
): Promise<User[]> => {
  return queryRole('>=', minRole);
};

export const getUsersWithRole = async (role: EnumValue<number>) => {
  return queryRole('==', role);
};

export const getUsersWithRoleAndExclude = async (
  role: EnumValue<number>,
  userId: string[]
) => {
  const userQuery = query(
    collection(db, usersCollectionName),
    where('role', '==', role.value),
    where(documentId(), 'not-in', userId)
  );
  const snapshot = await getDocs(userQuery.withConverter(userConverter));

  return snapshot.docs.map((doc) => doc.data());
};

const queryRole = async (operator: WhereFilterOp, role: EnumValue<number>) => {
  const userQuery = query(
    collection(db, usersCollectionName),
    where('role', operator, role.value)
  );
  const snapshot = await getDocs(userQuery.withConverter(userConverter));

  return snapshot.docs.map((doc) => doc.data());
};
