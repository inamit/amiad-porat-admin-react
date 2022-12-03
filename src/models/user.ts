import { getUserRoleByValue, UserRoles } from './enums/userRoles';
import { FirestoreDataConverter } from 'firebase/firestore';
import { EnumValue } from './enums/enum';

export default interface User {
  uid: string;
  firstName: string;
  lastName: string;
  phoneNo: string;
  role: number;
  disabled: boolean;
  [extraField: string]: any;
}

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User) => {
    const userInfo: any = {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNo: user.phoneNo,
      role: user.role,
      birthDate: user.birthDate
    };

    if (user.grade) {
      userInfo.grade = user.grade;
    }

    if (user.group) {
      userInfo.group = user.group?.id ?? user.group?.value;
    }

    if (user.subjects) {
      userInfo.subjects = user.subjects;
    }

    return userInfo;
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);

    return {
      uid: snapshot.id,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNo: data.phoneNo,
      role: data.role,
      disabled: undefined
    };
  }
};
