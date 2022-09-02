import { Enum, EnumValue } from './enum';

export const Subjects: Enum<string> = {
  MATH: { value: 'math', label: 'מתמטיקה' },
  ENGLISH: { value: 'english', label: 'אנגלית' }
};

export const getSubjectByValue = (value: string): EnumValue<string> => {
  return Object.values(Subjects).find((subject) => subject.value === value);
};
