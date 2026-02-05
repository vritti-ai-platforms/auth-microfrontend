import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { resetPassword, type ResetPasswordResponse } from '../services/auth.service';

interface ResetPasswordParams {
  resetToken: string;
  newPassword: string;
}

type UseResetPasswordOptions = Omit<UseMutationOptions<ResetPasswordResponse, Error, ResetPasswordParams>, 'mutationFn'>;

export const useResetPassword = (options?: UseResetPasswordOptions) => {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordParams>({
    mutationFn: ({ resetToken, newPassword }: ResetPasswordParams) => resetPassword(resetToken, newPassword),
    ...options,
  });
};
