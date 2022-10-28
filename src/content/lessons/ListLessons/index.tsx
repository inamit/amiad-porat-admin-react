import Paper from '@mui/material/Paper';
import React, { useEffect, useRef } from 'react';
import { selectSchedule, useAppDispatch, useAppSelector } from 'store/store';
import { selectRooms, selectSubjects } from 'store/config/config.slice';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import {
  DialogContent,
  DialogTitle,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import { UserRoles } from 'models/enums/userRoles';
import Lesson from 'models/lesson';
import Scheduler, {
  Editing,
  Resource,
  Scrolling,
  View
} from 'devextreme-react/scheduler';
import { AppointmentFormOpeningEvent } from 'devextreme/ui/scheduler';
import AppointmentView from './AppointmentView';
import { AddBox, LibraryAdd } from '@mui/icons-material';
import AddBulkLessons from '../AddBulkLessons';
import AppointmentTooltip from './AppointmentTooltip';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import OpenLessons from '../OpenLessons';
import {
  createBulkLessons,
  loadLessons,
  selectMaxLessonsDate,
  selectMinLessonsDate
} from 'store/lessons/lessons.slice';
import AddLesson from '../AddLesson';
import { selectUsers } from 'store/users/users.slice';

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'absolute',
  '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
    bottom: theme.spacing(4),
    right: theme.spacing(2)
  }
}));

const ListLessons = (props) => {
  const scheduler = useRef<Scheduler>(null);
  const dispatch = useAppDispatch();

  const minDate = useAppSelector(selectMinLessonsDate);
  const maxDate = useAppSelector(selectMaxLessonsDate);

  const [addLessonProps, setAddLessonProps] = React.useState<{
    id?: string;
    date?: string | Date;
    tutorUid?: string;
    roomId?: string;
  }>({ date: new Date() });
  const [addLessonOpen, setAddLessonOpen] = React.useState<boolean>(false);
  const [addBulkLessonOpen, setAddBulkLessonOpen] =
    React.useState<boolean>(false);
  const [openLessonsOpen, setOpenLessonsOpen] = React.useState<boolean>(false);
  const data = useAppSelector(selectSchedule);

  const actions = [
    {
      icon: <AddBox />,
      name: 'הוספה בודדת',
      action: () => {
        setAddLessonProps({});
        setAddLessonOpen(true);
      }
    },
    {
      icon: <LibraryAdd />,
      name: 'הוספה מרובה',
      action: () => {
        setAddBulkLessonOpen(true);
      }
    },
    {
      icon: <LockOpenIcon />,
      name: 'פתיחת תגבורים',
      action: () => {
        setOpenLessonsOpen(true);
      }
    }
  ];

  const tutors = useAppSelector(selectUsers)
    .filter((user) => (user.role as unknown) >= UserRoles.TUTOR.value)
    .map((user) => {
      return {
        id: user.uid,
        text: `${user.firstName} ${user.lastName}`
      };
    });
  const subjects = useAppSelector(selectSubjects).map((subject) => ({
    id: subject.value,
    text: subject.label,
    color: subject.color.open
  }));
  const rooms = useAppSelector(selectRooms).map((room) => ({
    id: room.value,
    text: room.label
  }));

  useEffect(() => {
    if (rooms.filter((room) => room.id === '').length === 0) {
      rooms.push({ id: '', text: 'לא נבחר' });
    }
  }, [rooms]);
  useEffect(() => {
    if (tutors.filter((tutor) => tutor.id === '').length === 0) {
      tutors.push({ id: '', text: 'לא נבחר' });
    }
  }, [tutors]);

  const onAppointmentFormOpening = (e: AppointmentFormOpeningEvent) => {
    let { startDate, tutorUid, roomId, id } = e.appointmentData;
    e.cancel = true;
    setAddLessonProps({ id, date: startDate, tutorUid, roomId });
    setAddLessonOpen(true);
  };

  const addBulkLessonsCallback = (addedLessons: Lesson[]) => {
    scheduler.current.instance.beginUpdate();
    dispatch(createBulkLessons(addedLessons));

    scheduler.current.instance.endUpdate();
    setAddBulkLessonOpen(false);
  };

  const addLessonCallback = (available: boolean) => {
    if (available) {
      setAddLessonOpen(false);
    }
  };

  const openLessonsCallback = (updatedLessons: Lesson[]) => {
    scheduler.current.instance.beginUpdate();

    updatedLessons
      .map((lesson) => {
        const lessonTutor = tutors.find(
          (tutor) => tutor.id === lesson.tutor?.uid
        );
        return {
          id: lesson.id,
          tutorName: `${lessonTutor?.text || 'לא נבחר מתרגל'}`,
          startDate: lesson.start,
          endDate: lesson.end,
          tutorUid: lesson.tutor.uid,
          roomId: lesson.room.id,
          subject: lesson.subject,
          maxStudents: lesson.maxStudents,
          isOpen: lesson.isOpen,
          students: lesson.students
        };
      })
      .forEach((lesson) =>
        scheduler.current.instance.updateAppointment(lesson, lesson)
      );

    scheduler.current.instance.endUpdate();
    setOpenLessonsOpen(false);
  };

  const AppointmentTooltipWithProps = React.forwardRef((props, ref) => {
    return <AppointmentTooltip {...props} scheduler={scheduler} />;
  });

  return (
    <Paper>
      <Scheduler
        ref={scheduler}
        dataSource={data}
        startDayHour={10}
        endDayHour={21}
        defaultCurrentView="week"
        onAppointmentFormOpening={onAppointmentFormOpening}
        showAllDayPanel={false}
        appointmentComponent={AppointmentView}
        appointmentTooltipComponent={AppointmentTooltipWithProps}
        crossScrollingEnabled={true}
        showCurrentTimeIndicator={false}
        remoteFiltering={true}
        onCurrentDateChange={(currentDate: Date) => {
          scheduler.current.instance.beginUpdate();
          const curr = new Date(currentDate);
          const first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
          const last = first + 7; // last day is the first day + 6

          const startOfWeek = new Date(curr.setDate(first));
          const endOfWeek = new Date(curr.setDate(last));

          if (
            startOfWeek.getTime() < minDate?.getTime() ||
            endOfWeek.getTime() > maxDate?.getTime()
          ) {
            dispatch(
              loadLessons({ startDate: startOfWeek, endDate: endOfWeek })
            );
          }

          scheduler.current.instance.endUpdate();
        }}
      >
        <Editing allowResizing={false} />
        <View name="יום" type="day" />
        <View name="שבוע" type="week" />
        <View
          groups={['tutorUid']}
          name="קיבוץ לפי מתרגל"
          type="day"
          groupOrientation="horizontal"
        />
        <View
          groups={['roomId']}
          name="קיבוץ לפי חדר"
          type="day"
          groupOrientation="horizontal"
        />
        <Resource fieldExpr="tutorUid" dataSource={tutors} label="מתרגל" />
        <Resource fieldExpr="roomId" dataSource={rooms} label="חדר" />
        <Resource
          fieldExpr="subject"
          dataSource={subjects}
          label="מקצוע"
          useColorAsDefault={true}
        />
        <Scrolling mode="virtual" />
      </Scheduler>

      <StyledSpeedDial ariaLabel="הוספת תגבור" icon={<SpeedDialIcon />}>
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </StyledSpeedDial>

      <Dialog open={addLessonOpen} onClose={() => setAddLessonOpen(false)}>
        <DialogTitle>תגבור חדש</DialogTitle>
        <DialogContent>
          <AddLesson
            {...addLessonProps}
            addLessonCallback={addLessonCallback}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={addBulkLessonOpen}
        onClose={() => setAddBulkLessonOpen(false)}
      >
        <DialogTitle>הוספה מרובה של תגבורים</DialogTitle>
        <DialogContent>
          <AddBulkLessons addBulkLessonsCallback={addBulkLessonsCallback} />
        </DialogContent>
      </Dialog>

      <Dialog open={openLessonsOpen} onClose={() => setOpenLessonsOpen(false)}>
        <DialogTitle>פתיחת תגבורים</DialogTitle>
        <DialogContent>
          <OpenLessons openLessonsCallback={openLessonsCallback} />
        </DialogContent>
      </Dialog>
    </Paper>
  );
};

export default ListLessons;
