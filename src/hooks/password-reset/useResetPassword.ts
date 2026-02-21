import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type ResetPasswordResponse, resetPassword } from '@services/auth.service';

interface ResetPasswordParams {
  resetToken: string;
  newPassword: string;
}

type UseResetPasswordOptions = Omit<
  UseMutationOptions<ResetPasswordResponse, AxiosError, ResetPasswordParams>,
  'mutationFn'
>;

export function useResetPassword(options?: UseResetPasswordOptions) {
  return useMutation<ResetPasswordResponse, AxiosError, ResetPasswordParams>({
    mutationFn: ({ resetToken, newPassword }) => resetPassword(resetToken, newPassword),
    ...options,
  });
}
