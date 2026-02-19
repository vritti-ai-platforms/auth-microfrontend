import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { resendEmailOtp } from '../../services/onboarding.service';

type UseResendEmailOtpOptions = Omit<UseMutationOptions<void, AxiosError, void>, 'mutationFn'>;

export function useResendEmailOtp(options?: UseResendEmailOtpOptions) {
  return useMutation<void, AxiosError, void>({
    mutationFn: resendEmailOtp,
    ...options,
  });
}
