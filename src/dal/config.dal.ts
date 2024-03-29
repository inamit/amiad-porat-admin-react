import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { EnumValue } from 'models/enums/enum.js';
import { db } from '../firebaseConfig.js';
import { roomsCollectioname } from './room.dal';

const package_json = require('../../package.json');

const gradesCollectionName = 'grades';
const subjectsCollectionName = 'subjects';

export const getGrades = async () => {
  const gradesSnapshot = await getDocs(collection(db, gradesCollectionName));

  return gradesSnapshot.docs
    .map((doc) => ({ label: doc.get('label'), value: parseInt(doc.id) }))
    .sort((first, second) => first.value - second.value);
};

export const getSubjects = async () => {
  const subjectsSnapshot = await getDocs(
    collection(db, subjectsCollectionName)
  );

  return subjectsSnapshot.docs.map((doc) => doc.data() as EnumValue<any>);
};

export const getRooms = async (): Promise<EnumValue<string>[]> => {
  const roomsSnapshot = await getDocs(collection(db, roomsCollectioname));

  return roomsSnapshot.docs.map((doc) => ({
    value: doc.id,
    label: doc.get('name')
  }));
};

export const getWhatsNew = async (): Promise<string[]> => {
  const whatsNewSnapshot = await getDoc(
    doc(db, 'whatsNew', package_json.version)
  );

  return whatsNewSnapshot.get('value');
};
