import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  resendMobileVerification,
  type InitiateMobileVerificationDto,
  type MobileVerificationStatusResponse,
} from '../../services/onboarding.service';

type UseResendMobileVerificationOptions = Omit<
  UseMutationOptions<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>,
  'mutationFn'
>;

/**
 * React Query hook for resending mobile verification
 *
 * This generates a new verification token and sends it again.
 *
 * @param options - Optional mutation options
 * @returns Mutation object for resending verification
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useResendMobileVerification({
 *   onSuccess: (data) => {
 *     console.log('New verification sent:', data.verificationToken);
 *   }
 * });
 *
 * // Resend verification
 * mutate({
 *   phone: '+919876543210',
 *   phoneCountry: 'IN',
 *   method: 'WHATSAPP_INBOUND'
 * });
 * ```
 */
export const useResendMobileVerification = (options?: UseResendMobileVerificationOptions) => {
  return useMutation<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>({
    mutationFn: (data: InitiateMobileVerificationDto) => resendMobileVerification(data),
    ...options,
  });
};
