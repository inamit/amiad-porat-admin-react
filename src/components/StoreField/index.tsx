import { FormField } from 'models/fieldsConfigs';
import React from 'react';
import { useAppSelector } from 'store/store';

const StoreField = (props) => {
  let children: unknown[] = useAppSelector(props.field.select);

  if (props.field.map) {
    children = children.map(props.field.map);
  }

  const Field = props.childClass;
  return (
    <Field
      {...props}
      field={{ ...props.field, children: children } as FormField}
    />
  );
};

export default StoreField;
