import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type ResetPasswordResponse, resetPassword } from '../../services/auth.service';

interface ResetPasswordParams {
  resetToken: string;
  newPassword: string;
}

type UseResetPasswordOptions = Omit<UseMutationOptions<ResetPasswordResponse, Error, ResetPasswordParams>, 'mutationFn'>;

export function useResetPassword(options?: UseResetPasswordOptions) {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordParams>({
    mutationFn: ({ resetToken, newPassword }) => resetPassword(resetToken, newPassword),
    ...options,
  });
}
