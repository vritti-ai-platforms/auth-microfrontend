import { scheduleTokenRefresh, setToken } from '@vritti/quantum-ui/axios';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * OAuth Success Page
 *
 * Handles the redirect after successful OAuth authentication.
 * Extracts token and user state from query parameters and navigates
 * to the appropriate onboarding step.
 *
 * Uses unified auth: accessToken in query params, refreshToken in httpOnly cookie
 */
export const OAuthSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCallback = () => {
      try {
        // Extract query parameters
        const token = searchParams.get('token');
        const expiresIn = searchParams.get('expiresIn');
        const requiresPassword = searchParams.get('requiresPassword') === 'true';
        const step = searchParams.get('step');

        // Validate required parameters
        if (!token) {
          setError('No authentication token received. Please try again.');
          setTimeout(() => navigate('/signup', { replace: true }), 3000);
          return;
        }

        if (!step) {
          setError('Invalid OAuth response. Please try again.');
          setTimeout(() => navigate('/signup', { replace: true }), 3000);
          return;
        }

        // Store access token (refresh token is in httpOnly cookie set by backend)
        setToken(token);

        // Schedule proactive token refresh if expiresIn is provided
        if (expiresIn) {
          const expiresInSeconds = parseInt(expiresIn, 10);
          if (!Number.isNaN(expiresInSeconds)) {
            scheduleTokenRefresh(expiresInSeconds);
          }
        }

        // Navigate based on onboarding step
        if (requiresPassword) {
          // OAuth user needs to set a password
          navigate('/onboarding/set-password', { replace: true });
        } else {
          // Navigate based on the current onboarding step
          switch (step) {
            case 'VERIFY_EMAIL':
              navigate('/onboarding/verify-email', { replace: true });
              break;
            case 'VERIFY_PHONE':
              navigate('/onboarding/verify-mobile', { replace: true });
              break;
            case 'SET_PASSWORD':
              navigate('/onboarding/set-password', { replace: true });
              break;
            case 'MFA_SETUP':
              navigate('/onboarding/mfa-setup', { replace: true });
              break;
            case 'COMPLETE':
              navigate('/dashboard', { replace: true });
              break;
            default:
              // Fallback to verify-email if step is unknown
              navigate('/onboarding/verify-email', { replace: true });
          }
        }
      } catch (err) {
        console.error('OAuth callback processing error:', err);
        setError('An error occurred during authentication. Please try again.');
        setTimeout(() => navigate('/signup', { replace: true }), 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="rounded-md bg-red-50 p-4 border border-red-200 max-w-md">
          <Typography variant="body2" className="text-red-800 text-center">
            {error}
          </Typography>
        </div>
        <Typography variant="body2" intent="muted" className="text-center">
          Redirecting to signup page...
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <Typography variant="h4" align="center" className="text-foreground">
        Completing authentication...
      </Typography>
      <Typography variant="body2" intent="muted" className="text-center">
        Please wait while we set up your account
      </Typography>
    </div>
  );
};
