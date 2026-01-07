import { createContext, useContext } from 'react';

export interface OnboardingData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  currentStep: string;
  onboardingComplete: boolean;
  accountStatus: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface OnboardingContextType extends OnboardingData {
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
