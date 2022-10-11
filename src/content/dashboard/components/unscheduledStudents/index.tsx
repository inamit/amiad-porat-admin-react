import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Skeleton
} from '@mui/material';
import { getScheduledStudentsUidBetween } from 'dal/lessons.dal';
import { getUsersWithRole } from 'dal/users.dal';
import { UserRoles } from 'models/enums/userRoles';
import User from 'models/user';
import React, { useEffect } from 'react';
import { getString } from 'firebase/remote-config';
import { remoteConfig } from 'firebaseConfig';

const UnscheduledStudents = (props) => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [students, setStudents] = React.useState<User[]>([]);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  useEffect(() => {
    loadStudents();
  }, []);

  const whatsappMessageDefault = getString(
    remoteConfig,
    'unscheduledStudentWhatsappMessage'
  );

  const loadStudents = async () => {
    setLoading(true);

    const scheduledStudents = await getScheduledStudentsUidBetween(
      new Date(),
      endDate
    );

    try {
      const allStudents = await getUsersWithRole(UserRoles.STUDENT);
      setStudents(
        allStudents.filter(
          (student) => !scheduledStudents.includes(student.uid)
        )
      );
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };
  return (
    <Card>
      <CardHeader
        title="תלמידים שלא קבעו תגבור לשבוע הקרוב"
        subheader={`היום עד ${endDate.toLocaleDateString('he-IL')}`}
      />
      <CardContent>
        {loading ? (
          <Skeleton />
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default UnscheduledStudents;
