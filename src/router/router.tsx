import ListGroups from 'content/groups/ListGroups';
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
        path: '/login',
        element: <Login />
      }
    ]
  },
  {
    path: '/users',
    element: (
      <RequireAuth>
        <SidebarLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '',
        element: <Navigate to="/users/add" replace />
      },
      {
        path: 'add',
        element: <AddUser />
      }
    ]
  },
  {
    path: '/groups',
    element: (
      <RequireAuth>
        <SidebarLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '',
        element: <ListGroups />
      }
    ]
  }
];

export default routes;
