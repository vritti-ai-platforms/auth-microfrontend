import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { signup } from '../services/auth.service';
import type { SignupDto, SignupResponse } from '../services/auth.service';

type UseSignupOptions = Omit<UseMutationOptions<SignupResponse, Error, SignupDto>, 'mutationFn'>;

export const useSignup = (options?: UseSignupOptions) => {
  return useMutation<SignupResponse, Error, SignupDto>({
    mutationFn: (data: SignupDto) => signup(data),
    ...options,
  });
};
