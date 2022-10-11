export interface AddUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  birthDate: Date;
  password: string;
  role: number;
  subjects?: string[];
  grade?: number;
  group?: string;
}
