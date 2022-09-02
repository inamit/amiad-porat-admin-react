import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField
} from '@mui/material';

import React, { useEffect } from 'react';
import { AddUserForm } from './userFormModel';
import { addUserFields } from './addUserFields';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FieldType } from '../../../models/enums/fieldTypes';
import TextFieldSelect from '../../../components/TextFieldSelect';
import TextFieldAsyncSelect from '../../../components/TextFieldAsyncSelect';
import TextFieldIcon from '../../../components/TextFieldIcon';

import { httpsCallable } from 'firebase/functions';
import { FormField } from 'models/fieldsConfigs';
import { functions } from 'firebaseConfig';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import GenericFormFields from 'components/GenericFormFields';

const AddUser = () => {
  const initialValues: AddUserForm = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    birthDate: undefined,
    password: '',
    role: undefined
  };
  const [user, setUser] = React.useState<AddUserForm>(initialValues);
  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string;
  }>({});
  const [valid, setValid] = React.useState<boolean>(false);

  const MySwal = withReactContent(Swal);

  useEffect(() => {
    setValid(areFieldsValid());
  }, [user]);

  const isFieldValid = (field: FormField, addToList: boolean = true) => {
    const validationResult = field.validationFunction(
      user[field.objectLocation],
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

  const areFieldsValid = () => {
    return addUserFields
      .filter(
        (field) =>
          field.showConditions
            ?.map((condition) =>
              eval(user[condition.field] + condition.operator + condition.value)
            )
            .reduce((final, curr) => final && curr) ?? true
      )
      .reduce((acc, field) => isFieldValid(field, false) && acc, true);
  };

  const createUser = httpsCallable(functions, 'createUser');
  const addUser = async () => {
    const userToSend = { ...user };

    try {
      MySwal.showLoading();
      const response = await createUser({ ...userToSend });
      MySwal.hideLoading();
      MySwal.fire({ icon: 'success', title: 'המשתמש נוסף בהצלחה!' });
    } catch (error) {
      Swal.hideLoading();
      Swal.fire({
        icon: 'error',
        title: 'לא הצלחנו להוסיף את המשתמש',
        text: error.message
      });
    }
  };

  return (
    <Card
      sx={{
        '&': {
          margin: '5vh 10vw'
        }
      }}
    >
      <CardHeader title="יצירת משתמש חדש" />
      <Divider />
      <CardContent>
        <Box
          component="form"
          sx={{
            '&': { padding: '5px', display: 'flex', flexDirection: 'column' },
            '& .MuiTextField-root': { marginBottom: '3vh', width: '100%' }
          }}
          noValidate
          autoComplete="off"
        >
          <GenericFormFields
            formFields={addUserFields}
            formValues={user}
            setValues={setUser}
            isFieldValid={isFieldValid}
            validationErrors={validationErrors}
          />
          <Button
            sx={{ '&': { alignSelf: 'center' } }}
            disabled={!valid}
            onClick={() => {
              areFieldsValid() && addUser();
            }}
            variant="contained"
          >
            צור משתמש
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddUser;
