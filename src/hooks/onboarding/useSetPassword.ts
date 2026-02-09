import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { type SetPasswordResponse, setPassword } from '../../services/onboarding.service';

type UseSetPasswordOptions = Omit<UseMutationOptions<SetPasswordResponse, Error, string>, 'mutationFn'>;

export function useSetPassword(options?: UseSetPasswordOptions) {
  return useMutation<SetPasswordResponse, Error, string>({
    mutationFn: setPassword,
    ...options,
  });
}
