import { recoverToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface OAuthCallbackState {
  isLoading: boolean;
  error: string | null;
}

// Recovers the session from the OAuth redirect and navigates to the next step
export function useOAuthCallback(): OAuthCallbackState {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<OAuthCallbackState>({ isLoading: true, error: null });

  useEffect(() => {
    const process = async () => {
      const step = searchParams.get('step');

      if (!step) {
        setState({ isLoading: false, error: 'Invalid OAuth response. Please try again.' });
        setTimeout(() => navigate('../signup', { replace: true }), 3000);
        return;
      }

      const { success, expiresIn } = await recoverToken();

      if (!success) {
        setState({ isLoading: false, error: 'Failed to recover session. Please try again.' });
        setTimeout(() => navigate('../signup', { replace: true }), 3000);
        return;
      }

      if (expiresIn > 0) {
        scheduleTokenRefresh(expiresIn);
      }

      // Completed users go to dashboard
      if (step === 'COMPLETE') {
        window.location.href = '/';
        return;
      }

      // Onboarding users go to signup success
      navigate('../signup-success', {
        replace: true,
        state: { signupMethod: 'oauth', currentStep: step },
      });
    };

    process().catch(() => {
      setState({ isLoading: false, error: 'An error occurred. Please try again.' });
      setTimeout(() => navigate('../signup', { replace: true }), 3000);
    });
  }, [searchParams, navigate]);

  return state;
}
