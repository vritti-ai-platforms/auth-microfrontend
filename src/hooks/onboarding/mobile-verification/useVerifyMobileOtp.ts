import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { verifyMobileOtp } from '@services/onboarding.service';

interface VerifyMobileOtpResponse {
  success: boolean;
  message: string;
}

type UseVerifyMobileOtpOptions = Omit<UseMutationOptions<VerifyMobileOtpResponse, AxiosError, string>, 'mutationFn'>;

export function useVerifyMobileOtp(options?: UseVerifyMobileOtpOptions) {
  return useMutation<VerifyMobileOtpResponse, AxiosError, string>({
    mutationFn: verifyMobileOtp,
    ...options,
  });
}
