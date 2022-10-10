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

const App = () => {
  const content = useRoutes(routes);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchConfig());
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
