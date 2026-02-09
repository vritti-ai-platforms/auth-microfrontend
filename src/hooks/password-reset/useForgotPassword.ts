import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type ForgotPasswordResponse, forgotPassword } from '../../services/auth.service';

type UseForgotPasswordOptions = Omit<UseMutationOptions<ForgotPasswordResponse, Error, string>, 'mutationFn'>;

export function useForgotPassword(options?: UseForgotPasswordOptions) {
  return useMutation<ForgotPasswordResponse, Error, string>({
    mutationFn: forgotPassword,
    ...options,
  });
}
