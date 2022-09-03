import { FormField } from 'models/fieldsConfigs';
import React from 'react';
import { ConfigValues } from 'store/config/config.model';
import { useAppSelector } from 'store/store';

const StoreField = (props) => {
  const children: ConfigValues = useAppSelector(props.field.select);

  const Field = props.childClass;
  return (
    <Field
      {...props}
      field={{ ...props.field, children: children.values } as FormField}
    />
  );
};

export default StoreField;
