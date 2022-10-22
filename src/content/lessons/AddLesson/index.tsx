import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import GenericFormFields, {
  areFieldsValid
} from 'components/GenericFormFields';
import React, { useEffect } from 'react';
import { addLessonFields } from './addLessonFields';

const AddLesson = (props) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [valid, setValid] = React.useState<boolean>(false);

  const [lesson, setLesson] = React.useState({
    date: props.date ?? new Date(),
    hour: props.date,
    subject: 'math',
    teacher: props.tutorUid ?? '',
    room: props.roomId ?? '',
    maxStudents: 5
  });
  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    setValid(
      areFieldsValid(
        addLessonFields,
        lesson,
        validationErrors,
        setValidationErrors,
        false
      )
    );
  }, [lesson]);

  const addLesson = () => {};
  return (
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
        formFields={addLessonFields}
        formValues={lesson}
        setValues={setLesson}
        validationErrors={validationErrors}
        setValidationErrors={setValidationErrors}
      />
      <LoadingButton
        sx={{ '&': { alignSelf: 'center' } }}
        disabled={!valid}
        onClick={() => {
          areFieldsValid(
            addLessonFields,
            lesson,
            validationErrors,
            setValidationErrors,
            true
          ) && addLesson();
        }}
        variant="contained"
        loading={loading}
      >
        צור שיעור
      </LoadingButton>
    </Box>
  );
};

export default AddLesson;
