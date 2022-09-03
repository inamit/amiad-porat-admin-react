import React, { useEffect } from 'react';
import { AsyncSelectFormField, FormField } from 'models/fieldsConfigs';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const AsyncField = (props) => {
  const [children, setChildren] = React.useState([]);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    getChildren();
  }, []);

  const getChildren = async () => {
    try {
      const values = await (
        props.field as AsyncSelectFormField
      ).asyncChildren();
      setChildren(values);
    } catch (error) {
      MySwal.fire({
        title: `שגיאה בקבלת נתונים עבור ${props.field.placeholder}`,
        icon: 'error',
        text: error.message
      });
    }
  };

  const Field = props.childClass;
  return <Field {...props} field={{ ...props.field, children } as FormField} />;
};

export default AsyncField;
