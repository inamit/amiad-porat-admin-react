import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import TextFieldAsyncSelect from 'components/TextFieldAsyncSelect';
import TextFieldIcon from 'components/TextFieldIcon';
import TextFieldSelect from 'components/TextFieldSelect';
import { FieldType } from 'models/enums/fieldTypes';
import { RadioGroupDirection } from 'models/enums/radioGroupDirection';
import { FormFieldType, RadioFormField } from 'models/fieldsConfigs';
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
        <TextFieldAsyncSelect
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
    case FieldType.RADIO_GROUP:
      fieldToShow = (
        <FormControl
          sx={{
            '&': {
              paddingBottom: '30px',
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          <FormLabel id={field.objectLocation + '-group-label'}>
            {field.placeholder}
          </FormLabel>
          <RadioGroup
            row={
              (field as RadioFormField).direction === RadioGroupDirection.ROW
            }
            aria-labelledby={field.objectLocation + '-group-label'}
            name={field.objectLocation + '-radio-buttons-group'}
            value={formValues[field.objectLocation]}
            onChange={({ target }) => {
              const newValues = { ...formValues };
              newValues[field.objectLocation] = target.value;

              setValues(newValues);
            }}
            onBlur={() => {
              isFieldValid(field);
            }}
          >
            {(field as RadioFormField).children.map((child) => (
              <FormControlLabel
                key={child.value}
                value={child.value}
                control={<Radio />}
                label={child.label}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );
      break;
    default:
      fieldToShow = (
        <TextFieldIcon
          startIcon={<FieldIcon />}
          placeholder={field.placeholder}
          key={field.objectLocation}
          type={field.type}
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
