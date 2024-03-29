import Dashboard from 'content/dashboard';
import ListGroups from 'content/groups/ListGroups';
import ListLessons from 'content/lessons/ListLessons';
import ListUsers from 'content/users/ListUsers';
import { lazy, Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router';
import SuspenseLoader from '../components/SuspenseLoader';
import BaseLayout from '../layouts/BaseLayout';
import SidebarLayout from '../layouts/SidebarLayout';
import RequireAuth from './requireAuth';

const Loader = (Component: any) => (props: any) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

const AddUser = Loader(lazy(() => import('content/users/AddUser')));
const Login = Loader(lazy(() => import('content/login')));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/login" replace />
      },
      {
        path: '/login',
        element: <Login />
      }
    ]
  },
  {
    element: (
      <RequireAuth>
        <SidebarLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '/dashboard',
        element: <Dashboard />
      },
      {
        path: '/users',
        children: [
          {
            path: '',
            element: <ListUsers />
          },
          {
            path: 'add',
            element: <AddUser />
          }
        ]
      },
      {
        path: '/groups',
        element: <ListGroups />
      },
      {
        path: '/lessons',
        element: <ListLessons />
      }
    ]
  }
];

export default routes;
