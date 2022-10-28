import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  TextField,
  Typography
} from '@mui/material';
import { UserRoles } from 'models/enums/userRoles';
import User from 'models/user';
import React, { useEffect } from 'react';
import { getString } from 'firebase/remote-config';
import { remoteConfig } from 'firebaseConfig';
import { useAppSelector } from 'store/store';
import { selectUsers } from 'store/users/users.slice';
import { selectLessons } from 'store/lessons/lessons.slice';
import StudentStatus from 'models/enums/studentStatus';
import { isSameDate } from 'utils/dateUtils';

const UnscheduledStudents = (props) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [startDate, setStartDate] = React.useState<Date>(new Date());
  const [endDate, setEndDate] = React.useState<Date>(() => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 7);
    return date;
  });
  const allUsers = useAppSelector(selectUsers);
  const allLessons = useAppSelector(selectLessons);

  const [students, setStudents] = React.useState<User[]>([]);

  useEffect(() => {
    loadStudents();
  }, [allLessons, allUsers, startDate, endDate]);

  const whatsappMessageDefault = getString(
    remoteConfig,
    'unscheduledStudentWhatsappMessage'
  );

  const loadStudents = async () => {
    setLoading(true);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    const scheduledStudents = allLessons
      .filter((lesson) => lesson.start >= startDate && lesson.end <= endDate)
      .map((lesson) =>
        lesson.students
          .filter((value) => value.status === StudentStatus.Scheduled)
          .map((student) => student.student?.uid)
      )
      .reduce((acc, uidArr) => [...acc, ...uidArr], []);

    const allStudents = allUsers.filter(
      (user) =>
        (user.role as unknown as number) === UserRoles.STUDENT.value &&
        !user.disabled
    );

    setStudents(
      allStudents.filter((student) => !scheduledStudents.includes(student.uid))
    );

    setLoading(false);
  };
  return (
    <Card>
      <CardHeader
        title="תלמידים שלא קבעו תגבור לשבוע הקרוב"
        subheader={`${
          isSameDate(startDate, new Date())
            ? 'היום'
            : startDate.toLocaleDateString('he-IL')
        } עד ${endDate.toLocaleDateString('he-IL')}`}
      />
      <CardContent>
        {loading ? (
          <Skeleton />
        ) : students.length > 0 ? (
          <List>
            {students.map((student) => {
              return (
                <ListItem key={student.uid}>
                  <ListItemText
                    primary={`${student.firstName} ${student.lastName}`}
                  ></ListItemText>
                  <a
                    href={`https://wa.me/${student.phoneNo}?text=${whatsappMessageDefault}`}
                    target="_blank"
                  >
                    {student.phoneNo}
                  </a>
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Typography variant="h4">כולם קבעו תגבורים 🥳</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UnscheduledStudents;
