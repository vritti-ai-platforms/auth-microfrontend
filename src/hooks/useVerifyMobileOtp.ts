import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { verifyMobileOtp } from '../services/onboarding.service';

interface VerifyMobileOtpResponse {
  success: boolean;
  message: string;
}

type UseVerifyMobileOtpOptions = Omit<
  UseMutationOptions<VerifyMobileOtpResponse, Error, string>,
  'mutationFn'
>;

/**
 * React Query hook for verifying mobile OTP
 *
 * Use this hook for SMS_OTP or MANUAL_OTP verification methods
 * where the user manually enters the OTP.
 *
 * @param options - Optional mutation options
 * @returns Mutation object for OTP verification
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = useVerifyMobileOtp({
 *   onSuccess: () => {
 *     console.log('Phone verified!');
 *   },
 *   onError: (error) => {
 *     console.error('Invalid OTP:', error.message);
 *   }
 * });
 *
 * // Verify OTP
 * mutate('123456');
 * ```
 */
export const useVerifyMobileOtp = (options?: UseVerifyMobileOtpOptions) => {
  return useMutation<VerifyMobileOtpResponse, Error, string>({
    mutationFn: (otp: string) => verifyMobileOtp(otp),
    ...options,
  });
};
