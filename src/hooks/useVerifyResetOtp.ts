import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { verifyResetOtp, type VerifyResetOtpResponse } from '../services/auth.service';

interface VerifyResetOtpParams {
  email: string;
  otp: string;
}

type UseVerifyResetOtpOptions = Omit<UseMutationOptions<VerifyResetOtpResponse, Error, VerifyResetOtpParams>, 'mutationFn'>;

export const useVerifyResetOtp = (options?: UseVerifyResetOtpOptions) => {
  return useMutation<VerifyResetOtpResponse, Error, VerifyResetOtpParams>({
    mutationFn: ({ email, otp }: VerifyResetOtpParams) => verifyResetOtp(email, otp),
    ...options,
  });
};
