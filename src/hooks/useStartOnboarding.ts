import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { startOnboarding } from '../services/onboarding.service';
import type { StartOnboardingResponse } from '../services/onboarding.service';

type UseStartOnboardingOptions = Omit<
  UseMutationOptions<StartOnboardingResponse, Error, void>,
  'mutationFn'
>;

export const useStartOnboarding = (options?: UseStartOnboardingOptions) => {
  return useMutation<StartOnboardingResponse, Error, void>({
    mutationFn: () => startOnboarding(),
    ...options,
  });
};
