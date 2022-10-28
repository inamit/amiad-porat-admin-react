import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import GenericFormFields, {
  areFieldsValid
} from 'components/GenericFormFields';
import { isRoomAvailable, isTutorAvailable } from 'dal/lessons.dal';
import Lesson from 'models/lesson';
import React, { useEffect } from 'react';
import { createOrUpdateLesson } from 'store/lessons/lessons.slice';
import { useAppDispatch } from 'store/store';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { addLessonFields } from './addLessonFields';

const AddLesson = (props) => {
  const MySwal = withReactContent(Swal);

  const dispatch = useAppDispatch();

  const [loading, setLoading] = React.useState<boolean>(false);
  const [valid, setValid] = React.useState<boolean>(false);

  const [lesson, setLesson] = React.useState<{
    id?: string;
    date: Date;
    hour: Date;
    subject: string;
    teacher: string;
    room: string;
    maxStudents: number;
  }>({
    id: props.id,
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

  const addLesson = async () => {
    setLoading(true);
    const lessonObj = new Lesson(
      lesson.id ?? '',
      new Date(
        lesson.date.getFullYear(),
        lesson.date.getMonth(),
        lesson.date.getDate(),
        lesson.hour.getHours(),
        lesson.hour.getMinutes(),
        lesson.hour.getSeconds()
      ),
      false,
      { uid: lesson.teacher },
      [],
      lesson.subject,
      { id: lesson.room },
      lesson.maxStudents
    );
    const available = await validateAvailability(lessonObj);

    if (available) {
      dispatch(createOrUpdateLesson(lessonObj));
    }

    setLoading(false);
    props.addLessonCallback(available);
  };

  const validateTutorAvailability = async (lesson: Lesson) => {
    if (
      !(await isTutorAvailable(
        lesson.start,
        lesson.tutor.uid,
        lesson.id ? [lesson.id] : undefined
      ))
    ) {
      const result = await MySwal.fire({
        icon: 'warning',
        title: 'שים לב!',
        text: `המתרגל שנבחר תפוס בשעה שנבחרה. האם ברצונך ${
          lesson.id ? 'לעדכן' : 'ליצור'
        } את התרגול?`,
        confirmButtonText: 'כן',
        showDenyButton: true,
        denyButtonText: 'לא, ביטול פעולה',
        allowOutsideClick: false
      });

      if (result.isDenied) {
        return false;
      }
    }

    return true;
  };

  const validateRoomAvailability = async (lesson: Lesson) => {
    if (
      !(await isRoomAvailable(
        lesson.start,
        lesson.room.id,
        lesson.id ? [lesson.id] : undefined
      ))
    ) {
      const result = await MySwal.fire({
        icon: 'warning',
        title: 'שים לב!',
        text: `הכיתה שנבחרה תפוסה בשעה שנבחרה. האם ברצונך ${
          lesson.id ? 'לעדכן' : 'ליצור'
        } את התרגול?`,
        confirmButtonText: 'כן',
        showDenyButton: true,
        denyButtonText: 'לא, ביטול פעולה',
        allowOutsideClick: false
      });

      if (result.isDenied) {
        return false;
      }
    }

    return true;
  };

  const validateAvailability = async (lesson: Lesson) => {
    const isTutorAvailable = await validateTutorAvailability(lesson);
    const isRoomAvailable = await validateRoomAvailability(lesson);

    return isTutorAvailable && isRoomAvailable;
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
