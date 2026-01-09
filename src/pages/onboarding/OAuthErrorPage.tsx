import { Button } from '@vritti/quantum-ui/Button';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * OAuth Error Page
 *
 * Displays errors that occur during the OAuth authentication flow.
 * Common scenarios:
 * - User cancels at OAuth provider consent screen
 * - Invalid or expired state token
 * - Email already exists with a password
 * - OAuth provider errors
 */
export const OAuthErrorPage: React.FC = () => {
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
    navigate('/signup', { replace: true });
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 px-4">
      {/* Error Icon */}
      <div className="rounded-full bg-red-100 p-4">
        <svg
          className="w-12 h-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Error</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <div className="text-center space-y-2 max-w-md">
        <Typography variant="h3" align="center" className="text-foreground">
          Authentication Failed
        </Typography>
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <Typography variant="body2" className="text-red-800">
            {getErrorMessage()}
          </Typography>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <Button type="button" onClick={handleBackToSignup} className="w-full bg-primary text-primary-foreground">
          Try Again
        </Button>
        <Button type="button" onClick={handleBackToLogin} variant="outline" className="w-full">
          Back to Login
        </Button>
      </div>

      {/* Help Text */}
      <Typography variant="body2" intent="muted" className="text-center max-w-md">
        If you continue to experience issues, please contact support or try signing up with email and password instead.
      </Typography>
    </div>
  );
};
