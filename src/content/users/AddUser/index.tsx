import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';

import React, { useEffect } from 'react';
import { AddUserForm } from './userFormModel';
import { addUserFields } from './addUserFields';

import { httpsCallable } from 'firebase/functions';
import { FormField } from 'models/fieldsConfigs';
import { functions } from 'firebaseConfig';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import GenericFormFields, {
  areFieldsValid
} from 'components/GenericFormFields';

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
    setValid(
      areFieldsValid(
        addUserFields,
        user,
        validationErrors,
        setValidationErrors,
        false
      )
    );
  }, [user]);

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
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
          />
          <Button
            sx={{ '&': { alignSelf: 'center' } }}
            disabled={!valid}
            onClick={() => {
              areFieldsValid(
                addUserFields,
                user,
                validationErrors,
                setValidationErrors,
                false
              ) && addUser();
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
