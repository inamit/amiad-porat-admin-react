import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import CardContent from '@mui/material/CardContent';
import { AppointmentType } from 'models/enums/appointmentType';
import { useAppSelector } from 'store/store';
import { selectSubjects } from 'store/config/config.slice';
import React from 'react';

const LessonDetails = ({ data, setIsLessonOpen }) => {
  const subjects = useAppSelector(selectSubjects);
  const subject = subjects.find((subject) => subject.value === data.subject);

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
        title={getAppointmentName()}
      />
      <CardContent>
        {/* <Typography variant="body2" color="text.secondary">
        This impressive paella is a perfect party dish and a fun meal to cook
        together with your guests. Add 1 cup of frozen peas along with the mussels,
        if you like.
      </Typography> */}
      </CardContent>
    </Card>
  );
};

export default LessonDetails;
