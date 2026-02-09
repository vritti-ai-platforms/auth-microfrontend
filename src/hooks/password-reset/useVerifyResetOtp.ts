import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type VerifyResetOtpResponse, verifyResetOtp } from '../../services/auth.service';

interface VerifyResetOtpParams {
  email: string;
  otp: string;
}

type UseVerifyResetOtpOptions = Omit<UseMutationOptions<VerifyResetOtpResponse, Error, VerifyResetOtpParams>, 'mutationFn'>;

export function useVerifyResetOtp(options?: UseVerifyResetOtpOptions) {
  return useMutation<VerifyResetOtpResponse, Error, VerifyResetOtpParams>({
    mutationFn: ({ email, otp }) => verifyResetOtp(email, otp),
    ...options,
  });
}
