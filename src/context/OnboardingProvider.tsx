import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { getStatus } from '../services/onboarding.service';
import { OnboardingContext, type OnboardingContextType } from './OnboardingContext';

const ONBOARDING_STATUS_KEY = ['onboarding', 'status'] as const;

const emptyState: Omit<OnboardingContextType, 'refetch'> = {
  email: '',
  currentStep: '',
  onboardingComplete: false,
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

  const contextValue: OnboardingContextType = {
    ...(data ?? emptyState),
    isLoading,
    error: error?.message ?? null,
    refetch: async () => {
      await refetch();
    },
  };

  return <OnboardingContext.Provider value={contextValue}>{children}</OnboardingContext.Provider>;
};
