import { Suspense, lazy } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// layouts
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';

import { _userPayment, _userAddressBook, _userInvoices, _userAbout } from '../_mock';

// guards
import GuestGuard from '../guards/GuestGuard';
import AuthGuard from '../guards/AuthGuard';
import RoleBasedGuard from '../guards/RoleBasedGuard';
// config
import { PATH_AFTER_LOGIN } from '../config';
// components
import LoadingScreen from '../components/LoadingScreen';

// ----------------------------------------------------------------------

const Loadable = (Component) => (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  return (
    <Suspense fallback={<LoadingScreen isDashboard={pathname.includes('/dashboard')} />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    },
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <Register />
            </GuestGuard>
          ),
        },
        {
          path: 'activate/:uid/:token',
          element: (
            <GuestGuard>
              <EmailConfirmation />
            </GuestGuard>
          ),
        },
        {
          path: 'send-email',
          element: (
            <AuthGuard>
              <SendEmail />
            </AuthGuard>
          ),
        },
        {
          path: 'confirm-reset/:uid/:token',
          element: (
            <GuestGuard>
              <ConfirmReset />
            </GuestGuard>
          ),
        },
        {
          path: 'callback',
          element: (
            <GuestGuard>
              <Callback />
            </GuestGuard>
          ),
        },
        { path: 'login-unprotected', element: <Login /> },
        { path: 'register-unprotected', element: <Register /> },
        { path: 'reset-password', element: <ResetPassword /> },
        { path: 'verify', element: <VerifyCode /> },
        { path: 'callback', element: <Callback /> },
      ],
    },

    // Dashboard Routes
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'app', element: <GeneralApp /> },
        { path: 'billing', element: <AccountBilling cards={_userPayment} addressBook={_userAddressBook} invoices={_userInvoices} />  },
        { path: 'social', element: <AccountSocialLinks myProfile={_userAbout} />  },
        {
          path: 'user',
          children: [
            { element: <Navigate to="/dashboard/user/profile" replace />, index: true },
            { path: 'list', element: (
              <RoleBasedGuard accessibleRoles={['admin', 'superadmin']}>
                <UserList />
              </RoleBasedGuard>
            ) },
            { path: 'new', element: (
              <RoleBasedGuard accessibleRoles={['superadmin']}>
                <UserCreate />
              </RoleBasedGuard>
            ) },
            { path: ':id/edit', element: (
              <RoleBasedGuard accessibleRoles={['superadmin']}>
                <UserCreate />
              </RoleBasedGuard>
            ) },
            { path: 'account', element: <UserAccount /> },
          ],
        },
      ],
    },
    // Main Routes
    {
      path: '*',
      element: <LogoOnlyLayout />,
      children: [
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" replace /> },
      ],
    },

    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// IMPORT COMPONENTS

// Authentication
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPassword = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
const VerifyCode = Loadable(lazy(() => import('../pages/auth/VerifyCode')));
const ConfirmReset = Loadable(lazy(() => import('../pages/auth/ConfirmReset')));
const SendEmail = Loadable(lazy(() => import('../pages/auth/SendEmail')));
const EmailConfirmation = Loadable(lazy(() => import('../pages/auth/EmailConfirmation')));
const Callback = Loadable(lazy(() => import('../pages/auth/Callback')));



// Dashboard
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')));

const UserList = Loadable(lazy(() => import('../pages/dashboard/UserList')));
const UserAccount = Loadable(lazy(() => import('../pages/dashboard/UserAccount')));
const UserCreate = Loadable(lazy(() => import('../pages/dashboard/UserCreate')));

// User Accounts

const AccountSocialLinks = Loadable(lazy(() => import('../sections/@dashboard/user/account/AccountSocialLinks')));
const AccountBilling = Loadable(lazy(() => import('../sections/@dashboard/user/account/AccountBilling')));

// Main
const NotFound = Loadable(lazy(() => import('../pages/Page404')));
