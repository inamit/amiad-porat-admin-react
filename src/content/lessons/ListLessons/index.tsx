import Paper from '@mui/material/Paper';
import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'store/store';
import {
  selectRoomsForScheduler,
  selectSubjects
} from 'store/config/config.slice';
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
import {
  Appointment,
  AppointmentClickEvent,
  AppointmentDblClickEvent,
  AppointmentFormOpeningEvent,
  AppointmentUpdatingEvent
} from 'devextreme/ui/scheduler';
import AppointmentView from './AppointmentView';
import { AddBox, LibraryAdd } from '@mui/icons-material';
import AddBulkLessons from '../AddBulkLessons';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import OpenLessons from '../OpenLessons';
import {
  createBulkLessons,
  loadLessons,
  selectLessonById,
  selectLessonsForScheduler,
  selectMaxLessonsDate,
  selectMinLessonsDate,
  updateLesson
} from 'store/lessons/lessons.slice';
import AddLesson from '../AddLesson';
import {
  selectUsersByRoleForScheduler,
  selectUsersGreaterThanRoleForScheduler
} from 'store/users/users.slice';
import { selectGroupsForScheduler } from 'store/groups/groups.slice';
import LessonDetails from './LessonDetails';

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
    maxStudents?: number;
    subject?: string;
  }>({ date: new Date() });
  const [selectedLesson, setSelectedLesson] = React.useState<Appointment>({});
  const [lessonDetailsOpen, setLessonDetailsOpen] =
    React.useState<boolean>(false);
  const [addLessonOpen, setAddLessonOpen] = React.useState<boolean>(false);
  const [addBulkLessonOpen, setAddBulkLessonOpen] =
    React.useState<boolean>(false);
  const [openLessonsOpen, setOpenLessonsOpen] = React.useState<boolean>(false);

  const [data, setData] = React.useState([]);

  const groups = useAppSelector(selectGroupsForScheduler);
  const lessons = useAppSelector(selectLessonsForScheduler);

  useEffect(() => {
    setData([...groups, ...lessons]);
  }, [groups, lessons]);

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

  const tutors = useAppSelector(
    selectUsersGreaterThanRoleForScheduler(UserRoles.TUTOR.value)
  );
  const students = useAppSelector(
    selectUsersByRoleForScheduler(UserRoles.STUDENT.value)
  );
  const subjects = useAppSelector(selectSubjects).map((subject) => ({
    id: subject.value,
    text: subject.label,
    color: subject.color.open
  }));
  const rooms = useAppSelector(selectRoomsForScheduler);

  const onAppointmentFormOpening = (e: AppointmentFormOpeningEvent) => {
    e.cancel = true;

    if (selectedLesson) {
      setAddLessonProps({
        id: selectedLesson.id,
        date: selectedLesson.startDate,
        tutorUid: selectedLesson.tutorUid,
        roomId: selectedLesson.roomId,
        maxStudents: selectedLesson.maxStudents,
        subject: selectedLesson.subject
      });
    } else {
      let { startDate, tutorUid, roomId, id, maxStudents, subject } =
        e.appointmentData;
      setAddLessonProps({
        id,
        date: startDate,
        tutorUid,
        roomId,
        maxStudents,
        subject
      });
    }
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
        return {
          id: lesson.id,
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

  const updateLessonFromScheduler = async (e: AppointmentUpdatingEvent) => {
    scheduler.current.instance.beginUpdate();
    const lesson = e.newData;

    let updatedLesson: Lesson = {
      id: lesson.id,
      start: lesson.startDate,
      end: lesson.endDate,
      isOpen: lesson.isOpen,
      tutor: { uid: lesson.tutorUid },
      students: selectLessonById(lesson.id).students,
      subject: lesson.subject,
      room: { id: lesson.roomId },
      maxStudents: lesson.maxStudents
    };
    await dispatch(updateLesson(updatedLesson));
    scheduler.current.instance.endUpdate();
  };

  const openLessonDetails = (
    e: AppointmentClickEvent | AppointmentDblClickEvent
  ) => {
    setSelectedLesson(e.appointmentData);
    setLessonDetailsOpen(true);
  };

  const setIsLessonOpen = (isOpen: boolean) => {
    scheduler.current.instance.updateAppointment(selectedLesson, {
      ...selectedLesson,
      isOpen
    });
    setLessonDetailsOpen(false);
  };

  const closeDetails = () => {
    setLessonDetailsOpen(false);
    setSelectedLesson({});
  };

  return (
    <Paper>
      <Scheduler
        ref={scheduler}
        dataSource={data}
        startDayHour={10}
        endDayHour={21}
        defaultCurrentView="week"
        onAppointmentFormOpening={onAppointmentFormOpening}
        onAppointmentUpdating={updateLessonFromScheduler}
        onAppointmentClick={openLessonDetails}
        showAllDayPanel={false}
        appointmentComponent={AppointmentView}
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

      <Dialog
        open={lessonDetailsOpen}
        fullWidth={true}
        onClose={() => {
          closeDetails();
        }}
      >
        <LessonDetails
          data={selectedLesson}
          scheduler={scheduler}
          setIsLessonOpen={setIsLessonOpen}
          students={students}
          close={closeDetails}
        />
      </Dialog>
      <Dialog open={addLessonOpen} onClose={() => setAddLessonOpen(false)}>
        <DialogTitle>תגבור חדש</DialogTitle>
        <DialogContent>
          <AddLesson
            {...addLessonProps}
            scheduler={scheduler}
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
