import { OnboardingProvider } from '@context/onboarding';
import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from './components/layouts/AuthLayout';
import './index.css';
import { AuthErrorPage } from './pages/auth/AuthErrorPage';
import { AuthSuccessPage } from './pages/auth/AuthSuccessPage';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { LoginPage } from './pages/auth/LoginPage';
import { MFAVerificationPage } from './pages/auth/MFAVerificationPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { ProfilePage } from './pages/settings/ProfilePage';
import { SecurityPage } from './pages/settings/SecurityPage';

// Auth routes exported for Module Federation consumption by the host app
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
      // Onboarding route — OnboardingProvider wraps OnboardingPage
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

// Browser router for standalone mode (running vritti-auth independently)
export const router = createBrowserRouter(authRoutes);
