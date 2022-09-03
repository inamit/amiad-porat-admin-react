import React, { useEffect } from 'react';
import logo from './logo.svg';
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

const App = () => {
  const content = useRoutes(routes);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchConfig());
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
