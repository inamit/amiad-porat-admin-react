import { LoadingButton } from '@mui/lab';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogContentText,
  Box,
  Button
} from '@mui/material';
import GenericFormFields from 'components/GenericFormFields';
import { createNewGroup } from 'dal/groups.dal';
import { getDoc } from 'firebase/firestore';
import { FormFieldType } from 'models/fieldsConfigs';
import Group, { groupConverter } from 'models/group';
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { addGroupFields } from './addGroupFields';
import { AddGroupModel } from './addGroupModel';

interface AddGroupProps {
  isOpen: boolean;
  onClose: (event: {}, reason: string, addedGroup?: Group) => void;
}

const AddGroup = (props: AddGroupProps) => {
  const MySwal = withReactContent(Swal);

  const initialGroup: AddGroupModel = {
    name: '',
    teacher: '',
    subject: '',
    dayInWeek: undefined,
    hour: undefined
  };
  const [group, setGroup] = React.useState<AddGroupModel>(initialGroup);
  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string;
  }>({});
  const [valid, setValid] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);

  useEffect(() => {
    setValid(areFieldsValid(false));
  }, [group]);

  const isFieldValid = (field: FormFieldType, addToList: boolean = true) => {
    const validationResult = field.validationFunction(
      group[field.objectLocation],
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

  const areFieldsValid = (setMessages: boolean) => {
    return addGroupFields
      .filter(
        (field) =>
          field.showConditions
            ?.map((condition) =>
              eval(
                group[condition.field] + condition.operator + condition.value
              )
            )
            .reduce((final, curr) => final && curr) ?? true
      )
      .reduce((acc, field) => isFieldValid(field, setMessages) && acc, true);
  };

  const addGroup = async () => {
    try {
      setLoading(true);
      const docRef = (await createNewGroup(group)).withConverter(
        groupConverter
      );
      const doc = await getDoc(docRef);
      setLoading(false);
      MySwal.fire({ title: 'השיעור נוסף', icon: 'success' });

      props.onClose(undefined, 'success', doc.data());
    } catch (error) {
      MySwal.hideLoading();
      MySwal.fire({
        title: 'לא היה ניתן להוסיף את השיעור',
        text: error.message,
        icon: 'error'
      });
    }
  };

  return (
    <Dialog open={props.isOpen} onClose={props.onClose}>
      <DialogTitle>יצירת שיעור חדש</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{
            '&': {
              display: 'flex',
              flexDirection: 'column',
              alignContent: 'center',
              paddingTop: '3px'
            },
            '& .MuiTextField-root': { marginBottom: '3vh', width: '100%' }
          }}
          noValidate
          autoComplete="off"
        >
          <GenericFormFields
            formFields={addGroupFields}
            formValues={group}
            setValues={setGroup}
            validationErrors={validationErrors}
            isFieldValid={isFieldValid}
          />
          <LoadingButton
            sx={{ '&': { alignSelf: 'center' } }}
            disabled={!valid}
            onClick={() => {
              areFieldsValid(true) && addGroup();
            }}
            variant="contained"
            loading={loading}
          >
            צור שיעור
          </LoadingButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroup;
