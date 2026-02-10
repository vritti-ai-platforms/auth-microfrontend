import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  type InitiateMobileVerificationDto,
  type MobileVerificationStatusResponse,
  resendMobileVerification,
} from '../../services/onboarding.service';

type UseResendMobileVerificationOptions = Omit<
  UseMutationOptions<MobileVerificationStatusResponse, AxiosError, InitiateMobileVerificationDto>,
  'mutationFn'
>;

export function useResendMobileVerification(options?: UseResendMobileVerificationOptions) {
  return useMutation<MobileVerificationStatusResponse, AxiosError, InitiateMobileVerificationDto>({
    mutationFn: resendMobileVerification,
    ...options,
  });
}
