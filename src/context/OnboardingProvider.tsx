import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { axios } from '@vritti/quantum-ui/axios';
import { OnboardingContext, type OnboardingContextType, type OnboardingData } from './OnboardingContext';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

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
  isLoading: false,
  error: null,
};

/**
 * Provides onboarding status data via context.
 * Auth is handled by axios (auto-recovery, 401 redirect).
 * Uses React Query for data fetching and caching.
 */
export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['onboarding', 'status'],
    queryFn: async () => {
      const response = await axios.get<OnboardingData>('/onboarding/status');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const contextValue: OnboardingContextType = {
    ...(data ?? emptyState),
    isLoading,
    error: error?.message ?? null,
    refetch: async () => { await refetch(); },
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};
