import { Tooltip } from '@mui/material';
import { formatDate } from 'devextreme/localization';
import StudentStatus from 'models/enums/studentStatus';
import { selectSubjects } from 'store/config/config.slice';
import { useAppSelector } from 'store/store';

import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { AppointmentType } from 'models/enums/appointmentType';
import { selectUserByUid } from 'store/users/users.slice';

const AppointmentView = (props) => {
  const subjects = useAppSelector(selectSubjects);
  const { targetedAppointmentData } = props.data;

  const getTutorName = (targetedAppointmentData) => {
    if (targetedAppointmentData.tutorUid === undefined) {
      return '';
    }

    const user = selectUserByUid(targetedAppointmentData.tutorUid);
    return `${
      targetedAppointmentData.type === AppointmentType.GROUP
        ? 'מורה:'
        : 'מתרגל:'
    } ${user.firstName} ${user.lastName}`;
  };

  return (
    <Tooltip title={getTutorName(targetedAppointmentData)} arrow>
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
        <div>{getTutorName(targetedAppointmentData)}</div>
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
