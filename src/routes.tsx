import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthLayout } from './components/layouts/AuthLayout';
import { OnboardingRouter } from './components/onboarding/OnboardingRouter';
import { OnboardingProvider } from './context';
import './index.css';
import { AuthErrorPage } from './pages/auth/AuthErrorPage';
import { AuthSuccessPage } from './pages/auth/AuthSuccessPage';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { LoginPage } from './pages/auth/LoginPage';
import { MFAVerificationPage } from './pages/auth/MFAVerificationPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ProfilePage } from './pages/settings/ProfilePage';
import { SecurityPage } from './pages/settings/SecurityPage';

/**
 * Auth routes configuration - exported for Module Federation consumption
 * This is used by the host application to merge auth routes
 */
export const authRoutes: RouteObject[] = [
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
      // Onboarding routes - wrapped with OnboardingProvider
      {
        path: 'onboarding',
        element: (
          <OnboardingProvider>
            <Outlet />
          </OnboardingProvider>
        ),
        children: [
          {
            index: true,
            element: <OnboardingRouter />,
          },
        ],
      },
    ],
  },
];

export const accountRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <ProfilePage />,
  },
  {
    path: 'security',
    element: <SecurityPage />,
  },
];

/**
 * Browser router instance for standalone auth app
 * Used when running vritti-auth independently
 */
export const router = createBrowserRouter(authRoutes);
