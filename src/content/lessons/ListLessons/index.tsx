import Paper from '@mui/material/Paper';
import React, { useEffect, useRef } from 'react';
import { getAllGroups } from 'dal/groups.dal';
import { useAppSelector } from 'store/store';
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
import { getUsersWithRoleBiggerThan } from 'dal/users.dal';
import { UserRoles } from 'models/enums/userRoles';
import Lesson from 'models/lesson';
import Scheduler, {
  Editing,
  Resource,
  Scrolling,
  View
} from 'devextreme-react/scheduler';
import { Appointment } from 'devextreme/ui/scheduler';
import CustomStore from 'devextreme/data/custom_store';
import {
  createNewLessonFromLessonObject,
  deleteLessonById,
  isRoomAvailable,
  isTutorAvailable,
  loadLessonsBetween,
  updateLesson
} from 'dal/lessons.dal';
import AppointmentView from './AppointmentView';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { AddBox, LibraryAdd } from '@mui/icons-material';
import AddBulkLessons from '../AddBulkLessons';
import AppointmentTooltip from './AppointmentTooltip';
import { WhereFilterOp } from 'firebase/firestore';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import OpenLessons from '../OpenLessons';

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  position: 'absolute',
  '&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft': {
    bottom: theme.spacing(4),
    right: theme.spacing(2)
  }
}));

const ListLessons = (props) => {
  const MySwal = withReactContent(Swal);
  const scheduler = useRef<Scheduler>(null);

  const [groups, setGroups] = React.useState(null);
  const [addLessonOpen, setAddLessonOpen] = React.useState<boolean>(false);
  const [openLessonsOpen, setOpenLessonsOpen] = React.useState<boolean>(false);

  const actions = [
    {
      icon: <AddBox />,
      name: 'הוספה בודדת',
      action: () => {
        scheduler.current.instance.showAppointmentPopup({}, true);
      }
    },
    {
      icon: <LibraryAdd />,
      name: 'הוספה מרובה',
      action: () => {
        setAddLessonOpen(true);
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

  const [tutors, setTutors] = React.useState<{ id: string; text: string }[]>(
    []
  );
  const subjects = useAppSelector(selectSubjects).values.map((subject) => ({
    id: subject.value,
    text: subject.label,
    color: subject.color.open
  }));
  const rooms = useAppSelector(selectRooms).values.map((room) => ({
    id: room.value,
    text: room.label
  }));

  useEffect(() => {
    rooms.push({ id: '', text: 'לא נבחר' });
  }, [rooms]);
  useEffect(() => {
    getUsersWithRoleBiggerThan(UserRoles.TUTOR).then((users) => {
      const parsedUsers = users.map((user) => {
        return {
          id: user.uid,
          text: `${user.firstName} ${user.lastName}`
        };
      });
      parsedUsers.push({ id: '', text: 'לא נבחר' });
      setTutors(parsedUsers);
    });
  }, []);

  const getGroups = async () => {
    const groups = await getAllGroups();
    const groupsAppointments: Appointment[] = groups.map((group) => {
      const today = new Date();

      let day = 0;

      if (today.getDay() === 7) {
        day = today.getDate() + group.day;
      } else if (group.day === 7) {
        day = today.getDate() - today.getDay();
      } else {
        day = today.getDate() - (today.getDay() - group.day);
      }
      const [hour, minutes] = group.hour.split(':');
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        day,
        parseInt(hour),
        parseInt(minutes)
      );
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      const groupTeacher = tutors.find(
        (tutor) => tutor.id === group.teacher?.uid
      );

      return {
        text: group.name,
        allDay: false,
        startDate,
        endDate,
        recurrenceRule: 'INTERVAL=1;FREQ=WEEKLY',
        disabled: true,
        tutorUid: group.teacher?.uid,
        tutorName: groupTeacher?.text ?? 'לא נבחר',
        type: 'group'
      };
    });

    return groupsAppointments;
  };

  const getLessons = async (filters: [string, WhereFilterOp, Date][]) => {
    const lessons = await loadLessonsBetween(filters);
    const lessonsAppointment: Appointment[] = lessons.map((lesson) => {
      const lessonTutor = tutors.find(
        (tutor) => tutor.id === lesson.tutor?.uid
      );

      return {
        id: lesson.id,
        tutorName: `${lessonTutor?.text || 'לא נבחר'}`,
        startDate: lesson.start,
        endDate: lesson.end,
        tutorUid: lesson.tutor?.uid,
        roomId: lesson.room?.id,
        subject: lesson.subject,
        maxStudents: lesson.maxStudents,
        isOpen: lesson.isOpen,
        students: lesson.students,
        type: 'lesson'
      };
    });

    return lessonsAppointment;
  };

  const getLessonsAndGroups = async (
    filters: [string, WhereFilterOp, Date][]
  ) => {
    if (!groups && tutors.length > 0) {
      setGroups(await getGroups());
    }
    const lessons = await getLessons(filters);

    return [...groups, ...lessons];
  };

  const customStore = new CustomStore({
    load: (options) => {
      return getLessonsAndGroups(options.filter[0][0]);
    },
    update: async (key, values) => {
      const updatedLesson = new Lesson(
        key.id,
        values.startDate,
        values.isOpen,
        { uid: values.tutorUid },
        [],
        values.subject,
        { id: values.roomId },
        values.maxStudents
      );

      let available = true;
      if (
        (key.startDate as Date).getTime() !==
        (values.startDate as Date).getTime()
      ) {
        available = await validateAvailability(updatedLesson);
      } else if (key.tutorUid !== values.tutorUid) {
        available = await validateTutorAvailability(updatedLesson);
      } else if (key.roomId !== values.roomId) {
        available = await validateRoomAvailability(updatedLesson);
      }

      if (available) {
        return updateLesson(updatedLesson);
      }
    },
    insert: async (values) => {
      const lesson = new Lesson(
        '',
        values.startDate,
        false,
        { uid: values.tutorUid },
        [],
        values.subject,
        { id: values.roomId },
        values.maxStudents
      );
      const available = await validateAvailability(lesson);

      if (available) {
        return createNewLessonFromLessonObject(lesson);
      }
    },
    remove: async (key) => {
      await deleteLessonById(key.id);
    }
  });

  const onAppointmentFormOpening = (e) => {
    const { form } = e;
    let { startDate } = e.appointmentData;

    form.option('items', [
      {
        label: {
          text: 'מתרגל'
        },
        editorType: 'dxSelectBox',
        dataField: 'tutorUid',
        editorOptions: {
          items: tutors,
          displayExpr: 'text',
          valueExpr: 'id'
        }
      },
      {
        label: {
          text: 'חדר'
        },
        editorType: 'dxSelectBox',
        dataField: 'roomId',
        editorOptions: {
          items: rooms,
          displayExpr: 'text',
          valueExpr: 'id'
        }
      },
      {
        label: {
          text: 'מקצוע'
        },
        dataField: 'subject',
        editorType: 'dxRadioGroup',
        editorOptions: {
          items: subjects,
          displayExpr: 'text',
          valueExpr: 'id'
        }
      },
      {
        label: {
          text: 'מספר מקסימלי של תלמידים'
        },
        dataField: 'maxStudents',
        editorType: 'dxTextBox',
        editorOptions: {
          value: '5',
          mode: 'number'
        }
      },
      {
        label: {
          text: 'התחלה'
        },
        dataField: 'startDate',
        editorType: 'dxDateBox',
        editorOptions: {
          width: '100%',
          type: 'datetime',
          onValueChanged(args) {
            startDate = args.value;
            form.updateData(
              'endDate',
              new Date(startDate.getTime() + 60 * 60 * 1000)
            );
          }
        }
      }
    ]);
  };

  const validateTutorAvailability = async (lesson: Lesson) => {
    if (!(await isTutorAvailable(lesson.start, lesson.tutor.uid))) {
      const result = await MySwal.fire({
        icon: 'warning',
        title: 'שים לב!',
        text: 'המתרגל שנבחר תפוס בשעה שנבחרה. האם ברצונך ליצור את התרגול?',
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
    if (!(await isRoomAvailable(lesson.start, lesson.room.id))) {
      const result = await MySwal.fire({
        icon: 'warning',
        title: 'שים לב!',
        text: 'הכיתה שנבחרה תפוסה בשעה שנבחרה. האם ברצונך ליצור את התרגול?',
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

  const addBulkLessonsCallback = (addedLessons: Lesson[]) => {
    scheduler.current.instance.beginUpdate();

    addedLessons
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
      .forEach((lesson) => scheduler.current.instance.addAppointment(lesson));

    scheduler.current.instance.endUpdate();
    setAddLessonOpen(false);
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
        dataSource={customStore}
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
