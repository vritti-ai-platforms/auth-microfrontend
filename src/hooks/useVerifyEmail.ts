import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { OnboardingStatusResponse } from '../services/onboarding.service';
import { verifyEmail } from '../services/onboarding.service';

type UseVerifyEmailOptions = Omit<UseMutationOptions<OnboardingStatusResponse, Error, string>, 'mutationFn'>;

export const useVerifyEmail = (options?: UseVerifyEmailOptions) => {
  return useMutation<OnboardingStatusResponse, Error, string>({
    mutationFn: (otp: string) => verifyEmail(otp),
    ...options,
  });
};
