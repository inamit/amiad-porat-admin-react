import FormField from 'components/FormField';
import { FormFieldType } from 'models/fieldsConfigs';

interface GenericFormFieldsProps<T> {
  formFields: FormFieldType[];
  formValues: T;
  setValues: (values: T) => void;
  isFieldValid: (field: FormFieldType) => void;
  validationErrors: {
    [key: string]: string;
  };
}
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
              isFieldValid={props.isFieldValid}
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
