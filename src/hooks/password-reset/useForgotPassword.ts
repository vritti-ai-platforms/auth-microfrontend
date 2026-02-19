import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type ForgotPasswordResponse, forgotPassword } from '../../services/auth.service';

type UseForgotPasswordOptions = Omit<UseMutationOptions<ForgotPasswordResponse, AxiosError, string>, 'mutationFn'>;

export function useForgotPassword(options?: UseForgotPasswordOptions) {
  return useMutation<ForgotPasswordResponse, AxiosError, string>({
    mutationFn: forgotPassword,
    ...options,
  });
}
