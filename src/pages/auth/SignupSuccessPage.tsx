import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2 } from 'lucide-react';
import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStartOnboarding } from '../../hooks/useStartOnboarding';
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
  const { email = 'user@example.com', isNewUser = true, signupMethod = 'email', currentStep } = state;

  // Use the start onboarding mutation
  const startOnboardingMutation = useStartOnboarding({
    onSuccess: (response) => {
      // Navigate to onboarding - OnboardingRouter will render the correct step
      if (response.currentStep === 'COMPLETED' || response.currentStep === 'COMPLETE') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    },
  });

  // Dynamic content based on user status
  const title = isNewUser ? 'Account created successfully!' : 'Welcome back!';
  const subtitle = isNewUser
    ? signupMethod === 'oauth'
      ? 'Your account has been created using OAuth authentication'
      : 'Your account has been created successfully'
    : 'Resume your onboarding to complete account setup';
  const buttonText = isNewUser ? 'Start Onboarding' : 'Resume Onboarding';
  const nextSteps = getNextSteps(signupMethod, currentStep);

  return (
    <div className="text-center space-y-6">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success/15">
          <CheckCircle2 className="h-8 w-8 text-success" />
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
          {nextSteps.map((step) => (
            <li key={step} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Start/Resume Onboarding Button */}
      <Button
        onClick={() => startOnboardingMutation.mutate()}
        className="w-full bg-primary text-primary-foreground"
        disabled={startOnboardingMutation.isPending}
      >
        {buttonText}
      </Button>

      {/* Helper Text */}
      <Typography variant="caption" align="center" intent="muted" className="text-center">
        This will guide you through securing your account
      </Typography>
    </div>
  );
};
