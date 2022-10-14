import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { getGroupsForSelect } from 'dal/groups.dal';
import { FieldType } from '../../../../models/enums/fieldTypes';
import { UserRoles } from '../../../../models/enums/userRoles';
import { FormFieldType } from '../../../../models/fieldsConfigs';
import { isNumberRequired } from 'validations/numberValidations';
import { isRequired } from 'validations/stringValidations';
import { isArrayRequired } from 'validations/arrayValidations';
import { selectGrades, selectSubjects } from 'store/config/config.slice';

export const addStudentFields: FormFieldType[] = [
  {
    showConditions: [
      {
        field: 'role',
        operator: '===',
        value: UserRoles.STUDENT.value
      }
    ],
    objectLocation: 'subjects',
    placeholder: 'מקצועות',
    type: FieldType.STORE_SELECT,
    icon: MenuBookOutlinedIcon,
    select: selectSubjects,
    required: true,
    multiple: true,
    validationFunction: isArrayRequired
  },
  {
    showConditions: [
      {
        field: 'role',
        operator: '===',
        value: UserRoles.STUDENT.value
      }
    ],
    objectLocation: 'grade',
    placeholder: 'כיתה',
    type: FieldType.STORE_SELECT,
    icon: SchoolOutlinedIcon,
    select: selectGrades,
    required: true,
    multiple: false,
    validationFunction: isNumberRequired
  },
  {
    showConditions: [
      {
        field: 'role',
        operator: '===',
        value: UserRoles.STUDENT.value
      }
    ],
    objectLocation: 'group',
    placeholder: 'שיעור',
    type: FieldType.ASYNC_SELECT,
    icon: SchoolOutlinedIcon,
    asyncChildren: getGroupsForSelect,
    required: true,
    multiple: true,
    validationFunction: isArrayRequired
  }
];
