import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { login } from '../services/auth.service';
import type { LoginDto, LoginResponse } from '../services/auth.service';

type UseLoginOptions = Omit<UseMutationOptions<LoginResponse, Error, LoginDto>, 'mutationFn'>;

export const useLogin = (options?: UseLoginOptions) => {
  return useMutation<LoginResponse, Error, LoginDto>({
    mutationFn: (data: LoginDto) => login(data),
    ...options,
  });
};
