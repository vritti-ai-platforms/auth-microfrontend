import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { forgotPassword, type ForgotPasswordResponse } from '../services/auth.service';

type UseForgotPasswordOptions = Omit<UseMutationOptions<ForgotPasswordResponse, Error, string>, 'mutationFn'>;

export const useForgotPassword = (options?: UseForgotPasswordOptions) => {
  return useMutation<ForgotPasswordResponse, Error, string>({
    mutationFn: (email: string) => forgotPassword(email),
    ...options,
  });
};
