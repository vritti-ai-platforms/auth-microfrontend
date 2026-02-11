import { Alert } from '@vritti/quantum-ui/Alert';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import { Typography } from '@vritti/quantum-ui/Typography';
import type React from 'react';
import { useOAuthCallback } from '../../hooks';

// Handles the redirect after OAuth authentication — recovers session and navigates
export const OAuthSuccessPage: React.FC = () => {
  const { error } = useOAuthCallback();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Alert variant="destructive" title="Authentication Failed" description={error} className="max-w-md" />
        <Typography variant="body2" intent="muted" className="text-center">
          Redirecting to signup page...
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Spinner className="size-8" />
      <Typography variant="h4" align="center" className="text-foreground">
        Completing authentication...
      </Typography>
      <Typography variant="body2" intent="muted" className="text-center">
        Please wait while we set up your account
      </Typography>
    </div>
  );
};
