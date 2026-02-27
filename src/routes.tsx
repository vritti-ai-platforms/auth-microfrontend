import { OnboardingProvider } from '@context/onboarding';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AppLayout } from './components/layouts/AppLayout';
import { AuthLayout } from './components/layouts/AuthLayout';
import './index.css';
import { AuthErrorPage } from './pages/auth/AuthErrorPage';
import { AuthSuccessPage } from './pages/auth/AuthSuccessPage';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { LoginPage } from './pages/auth/LoginPage';
import { MFAVerificationPage } from './pages/auth/MFAVerificationPage';
import { SignupPage } from './pages/auth/SignupPage';
import { HomePage } from './pages/cloud/home/HomePage';
import { InvitationsPage } from './pages/cloud/invitations/InvitationsPage';
import { CreateOrganizationPage } from './pages/cloud/organizations/CreateOrganizationPage';
import { OrganizationsPage } from './pages/cloud/organizations/OrganizationsPage';
import { ProfilePage } from './pages/cloud/settings/ProfilePage';
import { SecurityPage } from './pages/cloud/settings/SecurityPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';

// Routes shown when the user is not authenticated
export const cloudRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'auth-success',
        element: <AuthSuccessPage />,
      },
      {
        path: 'auth-error',
        element: <AuthErrorPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'mfa-verify',
        element: <MFAVerificationPage />,
      },
      {
        path: 'onboarding',
        element: (
          <OnboardingProvider>
            <OnboardingPage />
          </OnboardingProvider>
        ),
      },
    ],
  },
];

export const adminRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="home" replace />,
      },
      {
        path: 'home',
        element: <>Hello</>,
      },
    ],
  },
];

// Routes shown when the user is authenticated
export const authenticatedRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'organizations',
        element: <OrganizationsPage />,
      },
      {
        path: 'organizations/new',
        element: <CreateOrganizationPage />,
      },
      {
        path: 'invitations',
        element: <InvitationsPage />,
      },
      {
        path: 'account/profile',
        element: <ProfilePage />,
      },
      {
        path: 'account/security',
        element: <SecurityPage />,
      },
    ],
  },
];
