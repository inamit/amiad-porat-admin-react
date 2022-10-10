import { Grid } from '@mui/material';
import UnscheduledStudents from './components/unscheduledStudents';

const Dashboard = (props) => {
  return (
    <Grid container sx={{ margin: '20px' }}>
      <Grid item xs={4}>
        <UnscheduledStudents />
      </Grid>
    </Grid>
  );
};

export default Dashboard;
