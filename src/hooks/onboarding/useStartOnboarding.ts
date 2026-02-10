import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type StartOnboardingResponse, startOnboarding } from '../../services/onboarding.service';

type UseStartOnboardingOptions = Omit<UseMutationOptions<StartOnboardingResponse, AxiosError, void>, 'mutationFn'>;

export function useStartOnboarding(options?: UseStartOnboardingOptions) {
  return useMutation<StartOnboardingResponse, AxiosError, void>({
    mutationFn: startOnboarding,
    ...options,
  });
}
