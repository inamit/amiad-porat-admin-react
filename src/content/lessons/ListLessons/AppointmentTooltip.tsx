import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton
} from '@mui/material';
import { selectRooms, selectSubjects } from 'store/config/config.slice';
import { useAppSelector } from 'store/store';
import RoomIcon from '@mui/icons-material/Room';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import { formatDate } from 'devextreme/localization';

import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import DeleteIcon from '@mui/icons-material/Delete';
import { MutableRefObject } from 'react';
import { Scheduler } from 'devextreme-react';

const AppointmentTooltip = (props) => {
  const subjects = useAppSelector(selectSubjects).map((subject) => ({
    id: subject.value,
    text: subject.label,
    color: subject.color.open
  }));

  const data = props.data.targetedAppointmentData;

  const rooms = useAppSelector(selectRooms).map((room) => ({
    id: room.value,
    text: room.label
  }));

  const subject = subjects.find((subject) => subject.id === data.subject);
  const room = rooms.find((room) => room.id === data.roomId);

  return (
    <Card>
      <CardHeader
        sx={{ backgroundColor: subject?.color || 'blue', color: 'white' }}
        title={subject?.text ?? data.text}
        avatar={
          data.isOpen !== undefined ? (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                (
                  props.scheduler as MutableRefObject<Scheduler>
                ).current.instance.updateAppointment(data, {
                  ...data,
                  isOpen: !data.isOpen
                });
                (
                  props.scheduler as MutableRefObject<Scheduler>
                ).current.instance.hideAppointmentTooltip();
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
          !data.disabled ? (
            <IconButton
              sx={{ color: 'white' }}
              onClick={(e) => {
                e.stopPropagation();
                (
                  props.scheduler as MutableRefObject<Scheduler>
                ).current.instance.deleteAppointment(data);
                (
                  props.scheduler as MutableRefObject<Scheduler>
                ).current.instance.hideAppointmentTooltip();
              }}
            >
              <DeleteIcon />
            </IconButton>
          ) : null
        }
      />
      <CardContent>
        <Grid container>
          <Grid item xs={2} alignSelf="center">
            <RoomIcon />
          </Grid>
          <Grid item xs={10} textAlign="start" alignSelf="center">
            {data.type === 'group' ? 'לא נתמך' : room?.text ?? 'לא נבחר'}
          </Grid>
          <Grid item xs={2} alignSelf="center">
            <PersonIcon />
          </Grid>
          <Grid item xs={10} textAlign="start" alignSelf="center">
            {data.tutorName}
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

export default AppointmentTooltip;
