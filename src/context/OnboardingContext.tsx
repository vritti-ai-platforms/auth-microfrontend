import { createContext, useContext } from 'react';
import type { OnboardingStatusResponse } from '../services/onboarding.service';

export interface OnboardingContextType extends OnboardingStatusResponse {
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Accesses onboarding state — must be used within OnboardingProvider
export function useOnboarding(): OnboardingContextType {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
