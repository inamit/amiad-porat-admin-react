import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import React, { useEffect } from 'react';
import './App.css';
import { useRoutes } from 'react-router';
import routes from './router/router';
import ThemeProvider from './theme/ThemeProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import heLocale from 'date-fns/locale/he';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppDispatch } from 'store/store';
import { fetchConfig } from 'store/config/config.slice';

import config from 'devextreme/core/config';
import { loadMessages, locale } from 'devextreme/localization';
import heMessages from 'localization/devexpress-he.json';
import { loadGroups } from 'store/groups/groups.slice';
import { loadLessons } from 'store/lessons/lessons.slice';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from 'firebaseConfig';
import { loadUsers } from 'store/users/users.slice';

const App = () => {
  const content = useRoutes(routes);
  const dispatch = useAppDispatch();
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchConfig());
      dispatch(loadUsers());
      dispatch(loadGroups());

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(today);
      end.setDate(end.getDate() + 7);
      dispatch(loadLessons({ startDate: today, endDate: end }));
    }
  }, [user]);

  useEffect(() => {
    config({ rtlEnabled: true });
    loadMessages(heMessages);
    locale('he');
  }, []);

  return (
    <ThemeProvider>
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={heLocale}
      >
        <CssBaseline />
        {content}
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
