import FormField from 'components/FormField';
import { FormFieldType } from 'models/fieldsConfigs';

interface GenericFormFieldsProps<T> {
  formFields: FormFieldType[];
  formValues: T;
  setValues: (values: T) => void;
  validationErrors: {
    [key: string]: string;
  };
  setValidationErrors;
}

export const areFieldsValid = (
  fields,
  values,
  validationErrors,
  setValidationErrors,
  setMessages: boolean
) => {
  return fields
    .filter(
      (field) =>
        field.showConditions
          ?.map((condition) =>
            eval(values[condition.field] + condition.operator + condition.value)
          )
          .reduce((final, curr) => final && curr) ?? true
    )
    .reduce(
      (acc, field) =>
        isFieldValid(
          field,
          values,
          validationErrors,
          setValidationErrors,
          setMessages
        ) && acc,
      true
    );
};

export const isFieldValid = (
  field: FormFieldType,
  values,
  validationErrors,
  setValidationErrors,
  addToList: boolean = true
) => {
  const validationResult = field.validationFunction(
    values[field.objectLocation],
    field.placeholder
  );

  if (addToList) {
    setValidationErrors({
      ...validationErrors,
      [field.objectLocation]: validationResult.error?.message
    });
  }

  return validationResult.error?.message === undefined;
};

const GenericFormFields = <T,>(props: GenericFormFieldsProps<T>) => {
  return (
    <div>
      {props.formFields.map((field) => {
        const conditionsEval =
          field.showConditions
            ?.map((condition) =>
              eval(
                props.formValues[condition.field] +
                  condition.operator +
                  condition.value
              )
            )
            .reduce((final, curr) => final && curr) ?? true;

        if (conditionsEval) {
          return (
            <FormField
              key={field.objectLocation}
              field={field}
              formValues={props.formValues}
              isFieldValid={isFieldValid.bind(
                this,
                field,
                props.formValues,
                props.validationErrors,
                props.setValidationErrors
              )}
              setValues={props.setValues}
              validationErrors={props.validationErrors}
            />
          );
        }
      })}
    </div>
  );
};

export default GenericFormFields;
