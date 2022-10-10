import { FieldType } from 'models/enums/fieldTypes';
import { RadioGroupDirection } from 'models/enums/radioGroupDirection';
import { FormFieldType } from 'models/fieldsConfigs';
import { selectSubjects } from 'store/config/config.slice';
import { isDateRequired } from 'validations/dateValidations';
import { isRequired } from 'validations/stringValidations';

export const addBulkLessonFields: FormFieldType[] = [
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
    placeholder: 'תאריך',
    type: FieldType.DATE_PICKER,
    required: true,
    validationFunction: isDateRequired,
    objectLocation: 'date'
  },
  {
    objectLocation: 'startHour',
    placeholder: 'שעה ראשונה',
    type: FieldType.TIME_PICKER,
    required: true,
    validationFunction: isDateRequired
  },
  {
    objectLocation: 'endHour',
    placeholder: 'שעה אחרונה',
    type: FieldType.TIME_PICKER,
    required: true,
    validationFunction: isDateRequired
  }
];
