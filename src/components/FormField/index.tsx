import { TextField } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import AsyncField from 'components/AsyncField';
import StoreField from 'components/StoreField';
import TextFieldIcon from 'components/TextFieldIcon';
import TextFieldRadioGroup from 'components/TextFieldRadioGroup';
import TextFieldSelect from 'components/TextFieldSelect';
import { FieldType } from 'models/enums/fieldTypes';
import { FormFieldType } from 'models/fieldsConfigs';
import { ReactElement } from 'react';

interface FormFieldProps<T> {
  field: FormFieldType;
  formValues: T;
  setValues: (values: T) => void;
  isFieldValid: (field: FormFieldType) => void;
  validationErrors: {
    [key: string]: string;
  };
}
const FormField = <T,>({
  field,
  formValues,
  setValues,
  isFieldValid,
  validationErrors
}: FormFieldProps<T>) => {
  const FieldIcon = field.icon;

  let fieldToShow: ReactElement;

  switch (field.type) {
    case FieldType.DATE_PICKER:
      fieldToShow = (
        <DatePicker
          key={field.objectLocation}
          label={field.placeholder}
          value={formValues[field.objectLocation] ?? null}
          openTo="year"
          views={['year', 'month', 'day']}
          disableMaskedInput
          onChange={(newValue) => {
            const newValues = { ...formValues };
            newValues[field.objectLocation] = newValue;

            setValues(newValues);
            isFieldValid(field);
          }}
          renderInput={(params) => (
            <TextField
              onBlur={() => {
                isFieldValid(field);
              }}
              disabled
              error={Boolean(validationErrors[field.objectLocation])}
              helperText={validationErrors[field.objectLocation]}
              {...params}
            />
          )}
        />
      );
      break;
    case FieldType.TIME_PICKER:
      fieldToShow = (
        <TimePicker
          label={field.placeholder}
          value={formValues[field.objectLocation] ?? null}
          onChange={(newValue) => {
            const newValues = { ...formValues };
            newValues[field.objectLocation] = newValue;

            setValues(newValues);
            isFieldValid(field);
          }}
          renderInput={(params) => (
            <TextField
              onBlur={() => {
                isFieldValid(field);
              }}
              error={Boolean(validationErrors[field.objectLocation])}
              helperText={validationErrors[field.objectLocation]}
              {...params}
            />
          )}
        />
      );
      break;
    case FieldType.SELECT:
      fieldToShow = (
        <TextFieldSelect
          key={field.objectLocation}
          field={field}
          value={formValues[field.objectLocation]}
          error={Boolean(validationErrors[field.objectLocation])}
          helperText={validationErrors[field.objectLocation]}
          onBlur={() => {
            isFieldValid(field);
          }}
          onChange={({ target }) => {
            const newValues = { ...formValues };
            newValues[field.objectLocation] = target.value;

            setValues(newValues);
          }}
        />
      );
      break;
    case FieldType.ASYNC_SELECT:
      fieldToShow = (
        <AsyncField
          key={field.objectLocation}
          childClass={TextFieldSelect}
          field={field}
          value={formValues[field.objectLocation]}
          error={Boolean(validationErrors[field.objectLocation])}
          helperText={validationErrors[field.objectLocation]}
          onBlur={() => {
            isFieldValid(field);
          }}
          onChange={({ target }) => {
            const newValues = { ...formValues };
            newValues[field.objectLocation] = target.value;

            setValues(newValues);
          }}
        />
      );
      break;
    case FieldType.STORE_SELECT:
      fieldToShow = (
        <StoreField
          key={field.objectLocation}
          childClass={TextFieldSelect}
          field={field}
          value={formValues[field.objectLocation]}
          error={Boolean(validationErrors[field.objectLocation])}
          helperText={validationErrors[field.objectLocation]}
          onBlur={() => {
            isFieldValid(field);
          }}
          onChange={({ target }) => {
            const newValues = { ...formValues };
            newValues[field.objectLocation] = target.value;

            setValues(newValues);
          }}
        />
      );
      break;
    case FieldType.RADIO_GROUP:
      fieldToShow = (
        <TextFieldRadioGroup
          key={field.objectLocation}
          field={field}
          formValues={formValues}
          setValues={setValues}
          isFieldValid={isFieldValid}
        />
      );
      break;
    case FieldType.ASYNC_RADIO_GROUP:
      fieldToShow = (
        <AsyncField
          childClass={TextFieldRadioGroup}
          key={field.objectLocation}
          field={field}
          formValues={formValues}
          setValues={setValues}
          isFieldValid={isFieldValid}
        />
      );
      break;
    case FieldType.STORE_RADIO_GROUP:
      fieldToShow = (
        <StoreField
          childClass={TextFieldRadioGroup}
          key={field.objectLocation}
          field={field}
          formValues={formValues}
          setValues={setValues}
          isFieldValid={isFieldValid}
        />
      );
      break;
    default:
      fieldToShow = (
        <TextFieldIcon
          {...field}
          startIcon={field.icon ? <FieldIcon /> : undefined}
          key={field.objectLocation}
          value={formValues[field.objectLocation]}
          onChange={({ target }) => {
            const newValues = { ...formValues };
            newValues[field.objectLocation] = target.value;

            setValues(newValues);
          }}
          onBlur={() => {
            isFieldValid(field);
          }}
          error={Boolean(validationErrors[field.objectLocation])}
          helperText={validationErrors[field.objectLocation]}
        ></TextFieldIcon>
      );
  }

  return fieldToShow;
};

export default FormField;
