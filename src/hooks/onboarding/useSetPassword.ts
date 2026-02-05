import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { setPassword, type SetPasswordResponse } from '../../services/onboarding.service';

type UseSetPasswordOptions = Omit<UseMutationOptions<SetPasswordResponse, Error, string>, 'mutationFn'>;

export const useSetPassword = (options?: UseSetPasswordOptions) => {
  return useMutation<SetPasswordResponse, Error, string>({
    mutationFn: (password: string) => setPassword(password),
    ...options,
  });
};
