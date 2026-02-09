import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type SignupDto, type SignupResponse, signup } from '../../services/auth.service';

type UseSignupOptions = Omit<UseMutationOptions<SignupResponse, Error, SignupDto>, 'mutationFn'>;

export function useSignup(options?: UseSignupOptions) {
  return useMutation<SignupResponse, Error, SignupDto>({
    mutationFn: signup,
    ...options,
  });
}
