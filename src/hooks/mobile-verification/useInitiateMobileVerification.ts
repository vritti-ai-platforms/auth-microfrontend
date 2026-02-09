import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import {
  initiateMobileVerification,
  type InitiateMobileVerificationDto,
  type MobileVerificationStatusResponse,
} from '../../services/onboarding.service';

type UseInitiateMobileVerificationOptions = Omit<
  UseMutationOptions<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>,
  'mutationFn'
>;

export function useInitiateMobileVerification(options?: UseInitiateMobileVerificationOptions) {
  return useMutation<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>({
    mutationFn: initiateMobileVerification,
    ...options,
  });
}
