import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import GenericFormFields, {
  areFieldsValid
} from 'components/GenericFormFields';
import { getLessonsToOpen } from 'dal/lessons.dal';
import React, { useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { openLessonsFields } from './openLessonsFields';

const OpenLessons = (props) => {
  const MySwal = withReactContent(Swal);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [valid, setValid] = React.useState<boolean>(false);

  const [values, setValues] = React.useState<{
    startDate: Date;
    endDate: Date;
    subject: string;
  }>({
    startDate: new Date(),
    endDate: new Date(),
    subject: 'math'
  });
  const [validationErrors, setValidationErrors] = React.useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    setValid(
      areFieldsValid(
        openLessonsFields,
        values,
        validationErrors,
        setValidationErrors,
        false
      )
    );
  }, [values]);

  const openLessons = async () => {
    try {
      setLoading(true);
      const startDate = values.startDate;
      startDate.setHours(0, 0, 0, 0);

      const endDate = values.endDate;
      endDate.setDate(endDate.getDate() + 1);
      endDate.setHours(0, 0, 0, 0);

      let lessons = await getLessonsToOpen(startDate, endDate, values.subject);

      if (lessons.filter((lesson) => !lesson.tutor?.uid).length > 0) {
        const result = await MySwal.fire({
          icon: 'warning',
          title: 'שים לב!',
          text: 'לחלק מהתרגולים בטווח הנבחר לא שובצו מתרגלים. האם אתה בטוח שברצונך לפתוח אותם?',
          confirmButtonText: 'כן',
          showDenyButton: true,
          denyButtonText: 'לא, פתיחה רק למשובצים',
          showCancelButton: true,
          cancelButtonText: 'לא לפתוח תגבורים',
          allowOutsideClick: false
        });

        if (result.isDenied) {
          lessons = lessons.filter((lesson) => lesson.tutor?.uid);
        } else if (result.isDismissed) {
          return false;
        }
      }

      if (lessons.filter((lesson) => !lesson.room?.id).length > 0) {
        const result = await MySwal.fire({
          icon: 'warning',
          title: 'שים לב!',
          text: 'לחלק מהתרגולים בטווח הנבחר לא שובצו חדרים. האם אתה בטוח שברצונך לפתוח אותם?',
          confirmButtonText: 'כן',
          showDenyButton: true,
          denyButtonText: 'לא, פתיחה רק למשובצים',
          showCancelButton: true,
          cancelButtonText: 'לא לפתוח תגבורים',
          allowOutsideClick: false
        });

        if (result.isDenied) {
          lessons = lessons.filter((lesson) => lesson.room?.id);
        } else if (result.isDismissed) {
          return false;
        }
      }

      lessons = lessons.map((lesson) => ({ ...lesson, isOpen: true }));

      props.openLessonsCallback(lessons);
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
        formFields={openLessonsFields}
        formValues={values}
        setValues={setValues}
        validationErrors={validationErrors}
        setValidationErrors={setValidationErrors}
      />
      <LoadingButton
        sx={{ '&': { alignSelf: 'center' } }}
        disabled={!valid}
        onClick={() => {
          areFieldsValid(
            openLessonsFields,
            values,
            validationErrors,
            setValidationErrors,
            true
          ) && openLessons();
        }}
        variant="contained"
        loading={loading}
      >
        פתיחת תגבורים
      </LoadingButton>
    </Box>
  );
};

export default OpenLessons;
