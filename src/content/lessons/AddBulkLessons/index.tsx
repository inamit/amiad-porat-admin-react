import LoadingButton from '@mui/lab/LoadingButton';
import { Box } from '@mui/material';
import GenericFormFields, {
  areFieldsValid
} from 'components/GenericFormFields';
import { createNewLessonFromLessonObject } from 'dal/lessons.dal';
import Lesson from 'models/lesson';
import React, { useEffect } from 'react';
import { addBulkLessonFields } from './addBulkLessonFields';
import { BulkLessonModel } from './bulkLessonModel';

const AddBulkLessons = (props) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [valid, setValid] = React.useState<boolean>(false);

  const [lesson, setLesson] = React.useState<BulkLessonModel>({
    date: new Date(),
    startHour: undefined,
    endHour: undefined,
    subject: 'math'
  });
  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    setValid(
      areFieldsValid(
        addBulkLessonFields,
        lesson,
        validationErrors,
        setValidationErrors,
        false
      )
    );
  }, [lesson]);

  const addBulkLessons = async () => {
    try {
      setLoading(true);
      if (lesson.endHour.getTime() > lesson.startHour.getTime()) {
        const addedLessons: Lesson[] = [];
        const currentHour = lesson.startHour;

        while (currentHour.getTime() <= lesson.endHour.getTime()) {
          const startDate = new Date(lesson.date);
          startDate.setHours(
            currentHour.getHours(),
            currentHour.getMinutes(),
            0,
            0
          );

          const newLesson: Lesson = {
            id: '',
            start: startDate,
            end: undefined,
            isOpen: false,
            tutor: { uid: '' },
            students: [],
            subject: lesson.subject,
            room: { id: '' },
            maxStudents: 5
          };

          addedLessons.push(newLesson);

          currentHour.setHours(currentHour.getHours() + 1);
        }

        props.addBulkLessonsCallback(addedLessons);
      }
    } finally {
      setLoading(false);
    }
  };

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
        formFields={addBulkLessonFields}
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
            addBulkLessonFields,
            lesson,
            validationErrors,
            setValidationErrors,
            true
          ) && addBulkLessons();
        }}
        variant="contained"
        loading={loading}
      >
        צור שיעור
      </LoadingButton>
    </Box>
  );
};

export default AddBulkLessons;
