import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { SignupDto, SignupResponse } from '../services/auth.service';
import { signup } from '../services/auth.service';

type UseSignupOptions = Omit<UseMutationOptions<SignupResponse, Error, SignupDto>, 'mutationFn'>;

export const useSignup = (options?: UseSignupOptions) => {
  return useMutation<SignupResponse, Error, SignupDto>({
    mutationFn: (data: SignupDto) => signup(data),
    ...options,
  });
};
