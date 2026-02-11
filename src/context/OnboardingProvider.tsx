import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@vritti/quantum-ui/Spinner';
import type React from 'react';
import { getStatus } from '../services/onboarding.service';
import { type OnboardingContextType, OnboardingContext } from './OnboardingContext';

const ONBOARDING_STATUS_KEY = ['onboarding', 'status'] as const;

const emptyState: Omit<OnboardingContextType, 'refetch'> = {
  userId: '',
  email: '',
  firstName: '',
  lastName: '',
  currentStep: '',
  onboardingComplete: false,
  accountStatus: '',
  emailVerified: false,
  phoneVerified: false,
  signupMethod: 'email',
  isLoading: false,
  error: null,
};

// Fetches onboarding status and provides it via context
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ONBOARDING_STATUS_KEY,
    queryFn: getStatus,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner className="size-8 mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const contextValue: OnboardingContextType = {
    ...(data ?? emptyState),
    isLoading,
    error: error?.message ?? null,
    refetch: async () => {
      await refetch();
    },
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};
