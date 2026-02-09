import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type StartOnboardingResponse, startOnboarding } from '../../services/onboarding.service';

type UseStartOnboardingOptions = Omit<UseMutationOptions<StartOnboardingResponse, Error, void>, 'mutationFn'>;

export function useStartOnboarding(options?: UseStartOnboardingOptions) {
  return useMutation<StartOnboardingResponse, Error, void>({
    mutationFn: startOnboarding,
    ...options,
  });
}
