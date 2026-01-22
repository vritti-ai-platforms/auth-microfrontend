import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { setPassword } from '../services/onboarding.service';

type UseSetPasswordOptions = Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>;

export const useSetPassword = (options?: UseSetPasswordOptions) => {
  return useMutation<void, Error, string>({
    mutationFn: (password: string) => setPassword(password),
    ...options,
  });
};
