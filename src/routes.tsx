import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AuthLayout } from './components/layouts/AuthLayout';
import { OnboardingRouter } from './components/onboarding/OnboardingRouter';
import { OnboardingProvider } from './context';
import './index.css';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { LoginPage } from './pages/auth/LoginPage';
import { MFAVerificationPage } from './pages/auth/MFAVerificationPage';
import { SignupPage } from './pages/auth/SignupPage';
import { SignupSuccessPage } from './pages/auth/SignupSuccessPage';
import { OAuthErrorPage } from './pages/onboarding/OAuthErrorPage';
import { OAuthSuccessPage } from './pages/onboarding/OAuthSuccessPage';

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
        path: 'signup-success',
        element: <SignupSuccessPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'mfa-verify',
        element: <MFAVerificationPage />,
      },
      // OAuth callback routes - OUTSIDE OnboardingProvider to prevent premature token fetch
      // These routes extract token from URL params before any provider fetches data
      {
        path: 'onboarding/oauth-success',
        element: <OAuthSuccessPage />,
      },
      {
        path: 'onboarding/oauth-error',
        element: <OAuthErrorPage />,
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

/**
 * Browser router instance for standalone auth app
 * Used when running vritti-auth independently
 */
export const router = createBrowserRouter(authRoutes);
