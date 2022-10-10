import { FieldType } from 'models/enums/fieldTypes';
import { RadioGroupDirection } from 'models/enums/radioGroupDirection';
import { FormFieldType } from 'models/fieldsConfigs';
import { selectSubjects } from 'store/config/config.slice';
import { isDateRequired } from 'validations/dateValidations';
import { isRequired } from 'validations/stringValidations';

export const openLessonsFields: FormFieldType[] = [
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
    placeholder: 'תאריך התחלה',
    type: FieldType.DATE_PICKER,
    required: true,
    validationFunction: isDateRequired,
    objectLocation: 'startDate'
  },
  {
    placeholder: 'תאריך סיום',
    type: FieldType.DATE_PICKER,
    required: true,
    validationFunction: isDateRequired,
    objectLocation: 'endDate'
  }
];
