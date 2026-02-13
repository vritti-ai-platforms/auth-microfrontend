import { Alert } from '@vritti/quantum-ui/Alert';
import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import { AlertCircle } from 'lucide-react';
import type React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Displays errors that occur during the authentication flow (OAuth or email signup)
export const AuthErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Map common error codes to user-friendly messages
  const getErrorMessage = (): string => {
    if (errorDescription) {
      return errorDescription;
    }

    switch (error) {
      case 'access_denied':
        return 'You cancelled the authentication process. Please try again if you want to sign up with Google.';
      case 'invalid_state':
        return 'Invalid or expired authentication session. Please try again.';
      case 'email_exists':
        return 'An account with this email already exists. Please log in with your password instead.';
      case 'provider_error':
        return 'An error occurred with the authentication provider. Please try again later.';
      default:
        return 'An unexpected error occurred during authentication. Please try again.';
    }
  };

  const handleBackToSignup = () => {
    navigate('../signup', { replace: true });
  };

  const handleBackToLogin = () => {
    navigate('../login', { replace: true });
  };

  return (
    <div className="text-center space-y-6">
      {/* Error Icon */}
      <div className="flex justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/15">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>

      {/* Title & Error Message */}
      <div className="text-center space-y-4">
        <Typography variant="h4" align="center" className="text-foreground">
          Authentication Failed
        </Typography>
        <Alert variant="destructive" title="Error" description={getErrorMessage()} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button type="button" onClick={handleBackToSignup} className="w-full bg-primary text-primary-foreground">
          Try Again
        </Button>
        <Button type="button" onClick={handleBackToLogin} variant="outline" className="w-full">
          Back to Login
        </Button>
      </div>

      {/* Help Text */}
      <Typography variant="caption" align="center" intent="muted" className="text-center">
        If you continue to experience issues, please contact support or try signing up with email and password instead.
      </Typography>
    </div>
  );
};
