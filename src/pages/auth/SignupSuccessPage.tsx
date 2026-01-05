import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { startOnboarding } from '../../services/onboarding.service';
import type { SignupMethod } from '../../services/auth.service';
import { OnboardingStep } from '../../services/auth.service';

/**
 * Route state passed from SignupPage
 */
interface SignupSuccessState {
  email?: string;
  onboardingToken?: string;
  isNewUser?: boolean;
  signupMethod?: SignupMethod;
  currentStep?: OnboardingStep | string;
}

/**
 * Mapping of onboarding steps to their respective routes
 */
const STEP_ROUTES: Record<string, string> = {
  EMAIL_VERIFICATION: '/onboarding/verify-email',
  SET_PASSWORD: '/onboarding/set-password',
  MOBILE_VERIFICATION: '/onboarding/verify-mobile',
  PHONE_VERIFICATION: '/onboarding/verify-mobile',
  TWO_FACTOR_SETUP: '/onboarding/mfa-setup',
  MFA_SETUP: '/onboarding/mfa-setup',
  COMPLETED: '/dashboard',
};

/**
 * Gets the display text for the next steps based on signup method and user status
 */
function getNextSteps(signupMethod: SignupMethod | undefined, currentStep: string | undefined): string[] {
  const steps: string[] = [];

  // For OAuth users, email is already verified, they need to set password first
  if (signupMethod === 'oauth') {
    if (currentStep === 'SET_PASSWORD' || currentStep === OnboardingStep.SET_PASSWORD) {
      steps.push('Set your account password');
    }
  } else {
    // For email signup users
    if (currentStep === 'EMAIL_VERIFICATION' || currentStep === OnboardingStep.EMAIL_VERIFICATION) {
      steps.push('Verify your email address');
    }
  }

  // Common remaining steps
  steps.push('Set up mobile verification');
  steps.push('Configure two-factor authentication');
  steps.push('Complete your profile setup');

  return steps;
}

export const SignupSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract state from navigation
  const state = (location.state as SignupSuccessState) || {};
  const {
    email = 'user@example.com',
    isNewUser = true,
    signupMethod = 'email',
    currentStep,
  } = state;

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic content based on user status
  const title = isNewUser ? 'Account created successfully!' : 'Welcome back!';
  const subtitle = isNewUser
    ? signupMethod === 'oauth'
      ? 'Your account has been created using OAuth authentication'
      : 'Your account has been created successfully'
    : 'Resume your onboarding to complete account setup';
  const buttonText = isNewUser ? 'Start Onboarding' : 'Resume Onboarding';
  const nextSteps = getNextSteps(signupMethod, currentStep);

  /**
   * Handles the start/resume onboarding button click
   * Calls the API to start onboarding (which sends OTP if needed)
   * Then navigates to the appropriate step route
   */
  const handleStartOnboarding = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await startOnboarding();

      // Get the route for the current step
      const stepRoute = STEP_ROUTES[response.currentStep];

      if (stepRoute) {
        navigate(stepRoute, { replace: true });
      } else {
        // Fallback: navigate to the first onboarding step
        console.warn(`Unknown onboarding step: ${response.currentStep}`);
        navigate('/onboarding/verify-email', { replace: true });
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to start onboarding. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="bg-green-100 rounded-full p-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="text-center space-y-1">
        <Typography variant="h4" align="center" className="text-foreground">
          {title}
        </Typography>
        <Typography variant="body2" align="center" intent="muted">
          {subtitle}
        </Typography>
      </div>

      {/* Email Display Box */}
      <div className="bg-accent rounded-lg p-3 text-center border border-border">
        <Typography variant="caption" intent="muted" className="block mb-1">
          Account email
        </Typography>
        <Typography variant="body2" className="font-medium text-foreground">
          {email}
        </Typography>
      </div>

      {/* Next Steps Section */}
      <div className="border border-border rounded-lg p-4 space-y-2">
        <Typography variant="body2" className="font-medium text-foreground">
          Next steps:
        </Typography>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {nextSteps.map((step, index) => (
            <li key={index} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <Typography variant="body2" className="text-destructive text-left">
            {error}
          </Typography>
        </div>
      )}

      {/* Start/Resume Onboarding Button */}
      <Button
        onClick={handleStartOnboarding}
        className="w-full bg-primary text-primary-foreground"
        disabled={isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? 'Starting...' : buttonText}
      </Button>

      {/* Helper Text */}
      <Typography variant="caption" align="center" intent="muted" className="text-center">
        This will guide you through securing your account
      </Typography>
    </div>
  );
};
