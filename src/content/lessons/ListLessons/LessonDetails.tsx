import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import RoomIcon from '@mui/icons-material/Room';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CardContent from '@mui/material/CardContent';
import { AppointmentType } from 'models/enums/appointmentType';
import { useAppSelector } from 'store/store';
import { selectRooms, selectSubjects } from 'store/config/config.slice';
import React from 'react';
import { selectLessonById } from 'store/lessons/lessons.slice';
import { selectUserByUid } from 'store/users/users.slice';
import Grid from '@mui/material/Grid';
import { formatDate } from 'devextreme/localization';

const LessonDetails = ({ data, setIsLessonOpen }) => {
  const subjects = useAppSelector(selectSubjects);
  const subject = subjects.find((subject) => subject.value === data.subject);
  const rooms = useAppSelector(selectRooms);
  const room = rooms.find((room) => room.value === data.roomId);

  const lesson = selectLessonById(data.id);

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
          <IconButton aria-label="edit">
            <EditIcon />
          </IconButton>
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
      </CardContent>
    </Card>
  );
};

export default LessonDetails;
