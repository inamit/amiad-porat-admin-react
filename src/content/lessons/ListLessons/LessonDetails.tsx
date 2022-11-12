import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import RoomIcon from '@mui/icons-material/Room';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CardContent from '@mui/material/CardContent';
import { AppointmentType } from 'models/enums/appointmentType';
import { useAppDispatch, useAppSelector } from 'store/store';
import { selectRooms, selectSubjects } from 'store/config/config.slice';
import React from 'react';
import {
  addStudentsToLesson,
  changeStudentStatus,
  selectLessonById
} from 'store/lessons/lessons.slice';
import { selectUserByUid } from 'store/users/users.slice';
import Grid from '@mui/material/Grid';
import { formatDate } from 'devextreme/localization';
import {
  Autocomplete,
  Chip,
  Menu,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import StudentStatus from 'models/enums/studentStatus';
import Swal from 'sweetalert2';
import { LoadingButton } from '@mui/lab';

const LessonDetails = ({ data, setIsLessonOpen, students }) => {
  const dispatch = useAppDispatch();

  const subjects = useAppSelector(selectSubjects);
  const subject = subjects.find((subject) => subject.value === data.subject);
  const rooms = useAppSelector(selectRooms);
  const room = rooms.find((room) => room.value === data.roomId);

  const lesson = selectLessonById(data.id);

  const [addUserValue, setAddUserValue] = React.useState([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingFromStore, setLoadingFromStore] =
    React.useState<boolean>(false);

  const getAppointmentName = () => {
    let type;

    switch (data.type) {
      case AppointmentType.LESSON:
        type = 'תגבור';
        break;
      case AppointmentType.GROUP:
        type = 'שיעור';
        break;
    }

    return `${type || ''} ${subject?.label || data?.text || ''}`;
  };

  const getTutor = () => {
    const user = selectUserByUid(lesson?.tutor?.uid);

    return user ? `${user.firstName ?? ''} ${user.lastName ?? ''}` : 'לא נבחר';
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [studentUid, setStudentUid] = React.useState<string>('');
  const open = Boolean(anchorEl);
  const handleClose = async (status?: StudentStatus) => {
    if (Object.values(StudentStatus).includes(status)) {
      setLoadingFromStore(true);
      Swal.showLoading();
      try {
        await dispatch(
          changeStudentStatus({
            lessonId: lesson.id,
            studentUid: studentUid,
            oldStatus: StudentStatus.Canceled,
            newStatus: status
          })
        );
        Swal.hideLoading();
        Swal.fire({
          icon: 'success',
          title: 'סטטוס התלמיד השתנה'
        });
        setLoadingFromStore(false);
      } catch (e) {
        console.log(e);
      }
    }
    setAnchorEl(null);
  };

  return (
    <Card>
      <CardHeader
        sx={{ backgroundColor: subject?.color.open || 'blue', color: 'white' }}
        avatar={
          data.isOpen !== undefined ? (
            <IconButton
              onClick={(e) => {
                setIsLessonOpen(!data.isOpen);
              }}
              sx={{
                color: 'white'
              }}
            >
              {data.isOpen ? (
                <LockOpenIcon fontSize="small" />
              ) : (
                <LockIcon fontSize="small" />
              )}
            </IconButton>
          ) : (
            <div></div>
          )
        }
        action={
          data.type === AppointmentType.LESSON ? (
            <div>
              {/* <IconButton aria-label="edit">
              <EditIcon sx={{ color: 'white' }} />
            </IconButton> */}
              <IconButton
                aria-label="delete"
                onClick={() => {
                  Swal.fire({
                    icon: 'warning',
                    title: 'האם ברצונך למחוק את התגבור?',
                    text: 'תלמידים שקבעו לתגבור הזה לא יקבלו הודעה על הביטול.'
                  });
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </div>
          ) : (
            <div></div>
          )
        }
        title={`${getAppointmentName()} | ${getTutor()}`}
      />
      <CardContent>
        <Grid container>
          <Grid item xs={2} alignSelf="center">
            <RoomIcon />
          </Grid>
          <Grid item xs={10} textAlign="start" alignSelf="center">
            {data.type === AppointmentType.GROUP
              ? 'לא נתמך'
              : room?.label ?? 'לא נבחר'}
          </Grid>
          <Grid item xs={2} alignSelf="center">
            <PersonIcon />
          </Grid>
          <Grid item xs={10} textAlign="start" alignSelf="center">
            {getTutor()}
          </Grid>
          <Grid item xs={2} alignSelf="center">
            <AccessTimeFilledIcon />
          </Grid>
          <Grid item xs={10} textAlign="start" alignSelf="center">
            {formatDate(data.startDate, 'shortTime')}
            {' - '}
            {formatDate(data.endDate, 'shortTime')}
          </Grid>
        </Grid>

        {data.type === AppointmentType.LESSON ? (
          <div>
            <Grid container>
              <Grid item xs={10} alignSelf="center">
                <Autocomplete
                  multiple
                  onChange={(e, value) => {
                    console.log(value);
                    setAddUserValue(value);
                  }}
                  filterSelectedOptions
                  value={addUserValue}
                  options={students.filter(
                    (student) =>
                      !lesson?.students.find(
                        (lessonStudent) =>
                          lessonStudent.student.uid === student.id
                      )
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="הוספת תלמיד לתגבור" />
                  )}
                />
              </Grid>
              <Grid item xs={2} textAlign="start" alignSelf="center">
                <LoadingButton
                  variant="contained"
                  loading={loading}
                  onClick={async () => {
                    setLoading(true);
                    await dispatch(
                      addStudentsToLesson({
                        lessonId: lesson?.id,
                        studentUids: addUserValue.map((value) => value.id)
                      })
                    );
                    setLoading(false);
                    setAddUserValue([]);
                  }}
                >
                  הוספה
                </LoadingButton>
              </Grid>
            </Grid>
            <Grid container paddingTop={2}>
              <Grid item xs={2} alignSelf="center">
                {<Typography variant="h3">קבעו:</Typography>}
              </Grid>
              <Grid item xs={10} textAlign="start" alignSelf="center">
                {lesson?.students
                  .filter(
                    (student) => student.status === StudentStatus.Scheduled
                  )
                  .map(({ student }) => {
                    const studentInfo = selectUserByUid(student.uid);

                    return (
                      <Chip
                        key={student.uid}
                        label={`${studentInfo.firstName} ${studentInfo.lastName}`}
                        onDelete={async () => {
                          const result = await Swal.fire({
                            icon: 'warning',
                            title: 'האם ברצונך לבטל לתלמיד את התגבור?',
                            text: '*לא תישלח הודעה לתלמיד',
                            confirmButtonText: 'כן',
                            showCancelButton: true,
                            cancelButtonText: 'לא'
                          });

                          if (result.isConfirmed) {
                            setLoadingFromStore(true);
                            Swal.showLoading();
                            await dispatch(
                              changeStudentStatus({
                                lessonId: lesson.id,
                                studentUid: student.uid,
                                oldStatus: StudentStatus.Scheduled,
                                newStatus: StudentStatus.Canceled
                              })
                            );
                            Swal.hideLoading();
                            Swal.fire({
                              icon: 'success',
                              title: 'התגבור בוטל בעבור התלמיד'
                            });
                            setLoadingFromStore(false);
                          }
                        }}
                      />
                    );
                  })}
              </Grid>
              <Grid item xs={2} alignSelf="center">
                {<Typography variant="h3">ביטלו:</Typography>}
              </Grid>
              <Grid item xs={10} textAlign="start" alignSelf="center">
                {lesson?.students
                  .filter(
                    (student) => student.status === StudentStatus.Canceled
                  )
                  .map(({ student }) => {
                    const studentInfo = selectUserByUid(student.uid);

                    return (
                      <Chip
                        key={student.uid}
                        label={`${studentInfo.firstName} ${studentInfo.lastName}`}
                        deleteIcon={<KeyboardArrowDownIcon />}
                        onDelete={(e) => {
                          setAnchorEl(e.currentTarget);
                          setStudentUid(student.uid);
                        }}
                      />
                    );
                  })}
              </Grid>
            </Grid>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button'
              }}
            >
              <MenuItem
                onClick={() => {
                  handleClose(StudentStatus.Scheduled);
                }}
              >
                קבע
              </MenuItem>
              <MenuItem
                disabled
                onClick={() => {
                  //   handleClose(StudentStatus.Arrived);
                }}
              >
                הגיע
              </MenuItem>
              <MenuItem
                disabled
                onClick={() => {
                  //   handleClose(StudentStatus.Missed);
                }}
              >
                לא הגיע
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <div></div>
        )}
      </CardContent>
    </Card>
  );
};

export default LessonDetails;
