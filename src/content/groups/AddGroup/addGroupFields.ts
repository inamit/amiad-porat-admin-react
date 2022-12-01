import { FormFieldType } from 'models/fieldsConfigs';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { isRequired } from 'validations/stringValidations';
import { FieldType } from 'models/enums/fieldTypes';
import { UserRoles } from 'models/enums/userRoles';
import { RadioGroupDirection } from 'models/enums/radioGroupDirection';
import { isNumberRequired } from 'validations/numberValidations';
import { DaysOfWeek } from 'models/enums/daysOfWeek';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { isDateRequired } from 'validations/dateValidations';
import { selectSubjects } from 'store/config/config.slice';
import { selectUsers } from 'store/users/users.slice';
import User from 'models/user';

export const addGroupFields: FormFieldType[] = [
  {
    objectLocation: 'name',
    icon: DriveFileRenameOutlineOutlinedIcon,
    placeholder: 'שם השיעור',
    required: true,
    validationFunction: isRequired
  },
  {
    objectLocation: 'teacher',
    placeholder: 'מורה',
    icon: PersonOutlinedIcon,
    type: FieldType.STORE_SELECT,
    select: selectUsers,
    filter: (user: User) => user.role >= UserRoles.TEACHER.value,
    map: (user: User) => ({
      value: user.uid,
      label: `${user.firstName} ${user.lastName}`
    }),
    required: true,
    multiple: false,
    validationFunction: isRequired
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
    objectLocation: 'dayInWeek',
    placeholder: 'יום השיעור',
    type: FieldType.SELECT,
    icon: CalendarTodayIcon,
    children: Object.values(DaysOfWeek),
    required: true,
    multiple: false,
    validationFunction: isNumberRequired
  },
  {
    objectLocation: 'hour',
    placeholder: 'שעת השיעור',
    type: FieldType.TIME_PICKER,
    required: true,
    validationFunction: isDateRequired
  }
];
