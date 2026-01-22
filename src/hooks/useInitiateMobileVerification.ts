import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  initiateMobileVerification,
  type InitiateMobileVerificationDto,
  type MobileVerificationStatusResponse,
} from '../services/onboarding.service';

type UseInitiateMobileVerificationOptions = Omit<
  UseMutationOptions<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>,
  'mutationFn'
>;

/**
 * React Query hook for initiating mobile verification
 *
 * @param options - Optional mutation options
 * @returns Mutation object for initiating verification
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = useInitiateMobileVerification({
 *   onSuccess: (data) => {
 *     console.log('Verification initiated:', data.verificationToken);
 *   }
 * });
 *
 * // Initiate verification
 * mutate({
 *   phone: '+919876543210',
 *   phoneCountry: 'IN',
 *   method: 'WHATSAPP_INBOUND'
 * });
 * ```
 */
export const useInitiateMobileVerification = (options?: UseInitiateMobileVerificationOptions) => {
  return useMutation<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>({
    mutationFn: (data: InitiateMobileVerificationDto) => initiateMobileVerification(data),
    ...options,
  });
};
