import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type OnboardingStatusResponse, verifyEmail } from '../../services/onboarding.service';

type UseVerifyEmailOptions = Omit<UseMutationOptions<OnboardingStatusResponse, Error, string>, 'mutationFn'>;

export function useVerifyEmail(options?: UseVerifyEmailOptions) {
  return useMutation<OnboardingStatusResponse, Error, string>({
    mutationFn: verifyEmail,
    ...options,
  });
}
