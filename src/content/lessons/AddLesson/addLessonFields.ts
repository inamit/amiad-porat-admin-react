import { FieldType } from 'models/enums/fieldTypes';
import { RadioGroupDirection } from 'models/enums/radioGroupDirection';
import { UserRoles } from 'models/enums/userRoles';
import { FormFieldType } from 'models/fieldsConfigs';
import User from 'models/user';
import { selectRooms, selectSubjects } from 'store/config/config.slice';
import { selectUsers } from 'store/users/users.slice';
import { isDateRequired } from 'validations/dateValidations';
import { isRequired } from 'validations/stringValidations';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import RoomIcon from '@mui/icons-material/Room';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import {
  isNumberBetween,
  isNumberRequired
} from 'validations/numberValidations';

export const addLessonFields: FormFieldType[] = [
  {
    placeholder: 'תאריך',
    type: FieldType.DATE_PICKER,
    required: true,
    validationFunction: isDateRequired,
    objectLocation: 'date'
  },
  {
    objectLocation: 'hour',
    placeholder: 'שעה',
    type: FieldType.TIME_PICKER,
    required: true,
    validationFunction: isDateRequired
  },
  {
    objectLocation: 'subject',
    placeholder: '',
    type: FieldType.STORE_RADIO_GROUP,
    select: selectSubjects,
    required: true,
    direction: RadioGroupDirection.ROW,
    validationFunction: isRequired
  },
  {
    objectLocation: 'teacher',
    placeholder: 'מורה',
    icon: PersonOutlinedIcon,
    type: FieldType.STORE_SELECT,
    select: selectUsers,
    filter: (user: User) => (user.role as unknown) >= UserRoles.TUTOR.value,
    map: (user: User) => ({
      value: user.uid,
      label: `${user.firstName} ${user.lastName}`
    }),
    required: true,
    multiple: false,
    validationFunction: isRequired
  },
  {
    objectLocation: 'room',
    placeholder: 'חדר',
    icon: RoomIcon,
    type: FieldType.STORE_SELECT,
    select: selectRooms,
    required: true,
    multiple: false,
    validationFunction: isRequired
  },
  {
    objectLocation: 'maxStudents',
    placeholder: 'מספר מקסימלי של תלמידים',
    icon: PeopleOutlineIcon,
    type: FieldType.NUMBER,
    required: true,
    validationFunction: (value, fieldName) =>
      isNumberRequired(value, fieldName) &&
      isNumberBetween(value, fieldName, 0, 20),
    min: 0,
    max: 20
  }
];
