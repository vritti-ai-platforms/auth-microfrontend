import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  resendMobileVerification,
  type InitiateMobileVerificationDto,
  type MobileVerificationStatusResponse,
} from '../../services/onboarding.service';

type UseResendMobileVerificationOptions = Omit<
  UseMutationOptions<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>,
  'mutationFn'
>;

export function useResendMobileVerification(options?: UseResendMobileVerificationOptions) {
  return useMutation<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>({
    mutationFn: resendMobileVerification,
    ...options,
  });
}
