import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { verifyMobileOtp } from '../../services/onboarding.service';

interface VerifyMobileOtpResponse {
  success: boolean;
  message: string;
}

type UseVerifyMobileOtpOptions = Omit<
  UseMutationOptions<VerifyMobileOtpResponse, Error, string>,
  'mutationFn'
>;

export function useVerifyMobileOtp(options?: UseVerifyMobileOtpOptions) {
  return useMutation<VerifyMobileOtpResponse, Error, string>({
    mutationFn: verifyMobileOtp,
    ...options,
  });
}
