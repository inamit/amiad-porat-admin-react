import { getUserRoleByValue, UserRoles } from './enums/userRoles';
import { FirestoreDataConverter } from 'firebase/firestore';
import { EnumValue } from './enums/enum';

export default class User {
  public uid: string;
  public firstName: string;
  public lastName: string;
  public phoneNo: string;
  public role: EnumValue<number>;

  [extraField: string]: any;

  static empty() {
    return new User('', '', '', '', UserRoles.STUDENT.value);
  }

  constructor(
    uid: string,
    firstName: string,
    lastName: string,
    phoneNo: string,
    role: number
  ) {
    this.uid = uid;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNo = phoneNo;
    this.role = getUserRoleByValue(role);
  }
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

    return new User(
      snapshot.id,
      data.firstName,
      data.lastName,
      data.phoneNo,
      data.role
    );
  }
};
