import { Spinner } from '@vritti/quantum-ui/Spinner';
import type React from 'react';
import { Navigate } from 'react-router-dom';
import { useOnboarding } from '../../context';
import { MFASetupFlowPage } from '../../pages/onboarding/MFASetupFlowPage';
import { SetPasswordPage } from '../../pages/onboarding/SetPasswordPage';
import { VerifyEmailPage } from '../../pages/onboarding/VerifyEmailPage';
import { VerifyMobileFlowPage } from '../../pages/onboarding/VerifyMobileFlowPage';

/**
 * OnboardingRouter - Switch-based router for onboarding steps
 *
 * Renders the appropriate onboarding component based on the current step
 * returned by the backend. This centralizes all navigation logic and prevents
 * users from skipping steps via URL manipulation.
 */
export const OnboardingRouter: React.FC = () => {
  const { currentStep, isLoading, onboardingComplete } = useOnboarding();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="size-8" />
      </div>
    );
  }

  // Completed → full reload to trigger AuthProvider with upgraded CLOUD session
  if (onboardingComplete || currentStep === 'COMPLETED' || currentStep === 'COMPLETE') {
    window.location.href = '/';
    return null;
  }

  // Render based on currentStep
  switch (currentStep) {
    case 'EMAIL_VERIFICATION':
      return <VerifyEmailPage />;

    case 'PHONE_VERIFICATION':
    case 'MOBILE_VERIFICATION':
      return <VerifyMobileFlowPage />;

    case 'SET_PASSWORD':
      return <SetPasswordPage />;

    case 'MFA_SETUP':
    case 'TWO_FACTOR_SETUP':
      return <MFASetupFlowPage />;

    default:
      console.warn(`Unknown onboarding step: ${currentStep}`);
      return <Navigate to="../login" replace />;
  }
};
