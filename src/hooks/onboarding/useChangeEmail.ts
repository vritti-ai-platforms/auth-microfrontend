import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type SendEmailOtpResponse, changeEmail } from '@services/onboarding.service';

type UseChangeEmailOptions = Omit<UseMutationOptions<SendEmailOtpResponse, AxiosError, string>, 'mutationFn'>;

export function useChangeEmail(options?: UseChangeEmailOptions) {
  return useMutation<SendEmailOtpResponse, AxiosError, string>({
    mutationFn: changeEmail,
    ...options,
  });
}
