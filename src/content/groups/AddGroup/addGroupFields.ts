import { FormFieldType } from 'models/fieldsConfigs';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { isRequired } from 'validations/stringValidations';
import { FieldType } from 'models/enums/fieldTypes';
import { getUsersWithRoleBiggerThan } from 'dal/users.dal';
import { UserRoles } from 'models/enums/userRoles';
import { RadioGroupDirection } from 'models/enums/radioGroupDirection';
import { isNumberRequired } from 'validations/numberValidations';
import { DaysOfWeek } from 'models/enums/daysOfWeek';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { isDateRequired } from 'validations/dateValidations';
import { useAppSelector } from 'store/store';
import { selectSubjects } from 'store/config/config.slice';

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
    type: FieldType.ASYNC_SELECT,
    asyncChildren: async () => {
      const users = await getUsersWithRoleBiggerThan(UserRoles.TEACHER);
      return users.map((user) => ({
        value: user.uid,
        label: `${user.firstName} ${user.lastName}`
      }));
    },
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
