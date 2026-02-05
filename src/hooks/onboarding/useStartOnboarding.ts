import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { StartOnboardingResponse } from '../../services/onboarding.service';
import { startOnboarding } from '../../services/onboarding.service';

type UseStartOnboardingOptions = Omit<UseMutationOptions<StartOnboardingResponse, Error, void>, 'mutationFn'>;

export const useStartOnboarding = (options?: UseStartOnboardingOptions) => {
  return useMutation<StartOnboardingResponse, Error, void>({
    mutationFn: () => startOnboarding(),
    ...options,
  });
};
