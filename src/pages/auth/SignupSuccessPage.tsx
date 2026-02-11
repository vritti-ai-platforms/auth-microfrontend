import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { CheckCircle2 } from 'lucide-react';
import type React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStartOnboarding } from '../../hooks';

interface SignupSuccessState {
  email?: string;
  signupMethod?: 'email' | 'oauth';
  currentStep?: string;
}

// Returns display steps based on signup method
function getNextSteps(signupMethod: string, currentStep?: string): string[] {
  const steps: string[] = [];

  if (signupMethod === 'oauth') {
    if (currentStep === 'SET_PASSWORD') {
      steps.push('Set your account password');
    }
  } else {
    steps.push('Verify your email address');
  }

  steps.push('Set up mobile verification');
  steps.push('Configure two-factor authentication');

  return steps;
}

export const SignupSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as SignupSuccessState) || {};
  const { email, signupMethod = 'email', currentStep } = state;

  const isOAuth = signupMethod === 'oauth';

  // Calls POST /onboarding/start then navigates to onboarding router
  const startOnboardingMutation = useStartOnboarding({
    onSuccess: (response) => {
      if (response.currentStep === 'COMPLETE') {
        window.location.href = '/';
        return;
      }
      navigate('../onboarding', { replace: true });
    },
  });

  const title = isOAuth ? 'Account linked successfully!' : 'Account created successfully!';
  const subtitle = isOAuth
    ? 'Your account has been created using OAuth'
    : 'Your account has been created successfully';
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

      {/* Email Display Box — only shown for email signup */}
      {email && (
        <div className="bg-accent rounded-lg p-3 text-center border border-border">
          <Typography variant="caption" intent="muted" className="block mb-1">
            Account email
          </Typography>
          <Typography variant="body2" className="font-medium text-foreground">
            {email}
          </Typography>
        </div>
      )}

      {/* Next Steps */}
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

      {/* Start Onboarding */}
      <Button
        onClick={() => startOnboardingMutation.mutate()}
        className="w-full bg-primary text-primary-foreground"
        isLoading={startOnboardingMutation.isPending}
        loadingText="Loading..."
      >
        Start Onboarding
      </Button>

      <Typography variant="caption" align="center" intent="muted" className="text-center">
        This will guide you through securing your account
      </Typography>
    </div>
  );
};
