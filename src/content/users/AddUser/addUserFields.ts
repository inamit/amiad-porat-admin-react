import PersonOutline from '@mui/icons-material/PersonOutline';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PasswordOutlinedIcon from '@mui/icons-material/PasswordOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { UserRoles } from 'models/enums/userRoles';
import { addStudentFields } from './fields/addStudentFields';
import { FormFieldType } from '../../../models/fieldsConfigs';
import { FieldType } from 'models/enums/fieldTypes';
import {
  isEmail,
  isPassword,
  isPhoneNumber,
  isRequired
} from 'validations/stringValidations';
import { isDateRequired } from 'validations/dateValidations';
import { isNumberRequired } from 'validations/numberValidations';

export const addUserFields: FormFieldType[] = [
  {
    objectLocation: 'firstName',
    icon: PersonOutline,
    placeholder: 'שם פרטי',
    required: true,
    validationFunction: isRequired
  },
  {
    objectLocation: 'lastName',
    icon: PersonOutline,
    placeholder: 'שם משפחה',
    required: true,
    validationFunction: isRequired
  },
  {
    objectLocation: 'email',
    icon: EmailOutlined,
    placeholder: 'מייל',
    required: true,
    validationFunction: isEmail
  },
  {
    objectLocation: 'phoneNo',
    icon: PhoneOutlinedIcon,
    placeholder: 'מספר טלפון',
    required: true,
    validationFunction: isPhoneNumber
  },
  {
    objectLocation: 'birthDate',
    placeholder: 'תאריך לידה',
    type: FieldType.DATE_PICKER,
    required: true,
    validationFunction: isDateRequired
  },
  {
    objectLocation: 'password',
    placeholder: 'סיסמה',
    type: FieldType.PASSWORD,
    icon: PasswordOutlinedIcon,
    required: true,
    validationFunction: isPassword
  },
  {
    objectLocation: 'role',
    placeholder: 'סוג המשתמש',
    type: FieldType.SELECT,
    icon: ManageAccountsOutlinedIcon,
    children: Object.values(UserRoles),
    required: true,
    multiple: false,
    validationFunction: isNumberRequired
  },
  ...addStudentFields
];
