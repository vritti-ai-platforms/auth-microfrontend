import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { verifyEmail } from '../services/onboarding.service';
import type { OnboardingStatusResponse } from '../services/onboarding.service';

type UseVerifyEmailOptions = Omit<UseMutationOptions<OnboardingStatusResponse, Error, string>, 'mutationFn'>;

export const useVerifyEmail = (options?: UseVerifyEmailOptions) => {
  return useMutation<OnboardingStatusResponse, Error, string>({
    mutationFn: (otp: string) => verifyEmail(otp),
    ...options,
  });
};
