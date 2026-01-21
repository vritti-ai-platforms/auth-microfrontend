import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { resendEmailOtp } from '../services/onboarding.service';

type UseResendEmailOtpOptions = Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>;

export const useResendEmailOtp = (options?: UseResendEmailOtpOptions) => {
  return useMutation<void, Error, void>({
    mutationFn: () => resendEmailOtp(),
    ...options,
  });
};
