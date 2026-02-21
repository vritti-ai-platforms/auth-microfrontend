import { OnboardingStep } from '@services/auth.service';

/**
 * Mapping of onboarding steps to their respective routes
 */
export const STEP_ROUTES: Record<string, string> = {
  [OnboardingStep.EMAIL_VERIFICATION]: "/onboarding/verify-email",
  [OnboardingStep.SET_PASSWORD]: "/onboarding/set-password",
  [OnboardingStep.PHONE_VERIFICATION]: "/onboarding/verify-mobile",
  [OnboardingStep.MFA_SETUP]: "/onboarding/mfa-setup",
  [OnboardingStep.COMPLETED]: "/dashboard",
};
