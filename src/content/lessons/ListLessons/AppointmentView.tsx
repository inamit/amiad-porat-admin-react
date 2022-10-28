import { Tooltip } from '@mui/material';
import { formatDate } from 'devextreme/localization';
import StudentStatus from 'models/enums/studentStatus';
import { selectSubjects } from 'store/config/config.slice';
import { useAppSelector } from 'store/store';

import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';

const AppointmentView = (props) => {
  const subjects = useAppSelector(selectSubjects);
  const { targetedAppointmentData } = props.data;

  const tutor =
    targetedAppointmentData.tutorName !== undefined
      ? `${targetedAppointmentData.type === 'group' ? 'מורה:' : 'מתרגל:'} ${
          targetedAppointmentData.tutorName
        }`
      : '';

  return (
    <Tooltip title={tutor} arrow>
      <div>
        {targetedAppointmentData.isOpen !== undefined ? (
          <div style={{ position: 'absolute', left: '5px' }}>
            {targetedAppointmentData.isOpen ? (
              <LockOpenIcon fontSize="small" />
            ) : (
              <LockIcon fontSize="small" />
            )}
          </div>
        ) : (
          <div></div>
        )}
        <div>
          {subjects.find(
            (subject) => subject.value === targetedAppointmentData.subject
          )?.label || targetedAppointmentData.text}
        </div>
        <div>{tutor}</div>
        <div>
          {targetedAppointmentData.students?.length !== undefined
            ? `${
                targetedAppointmentData.students.map(
                  (value) => value.status === StudentStatus.Scheduled
                ).length
              } תלמידים`
            : ''}
        </div>
        <div>
          {formatDate(targetedAppointmentData.startDate, 'shortTime')}
          {' - '}
          {formatDate(targetedAppointmentData.endDate, 'shortTime')}
        </div>
      </div>
    </Tooltip>
  );
};

export default AppointmentView;
