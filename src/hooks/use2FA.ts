import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import {
  initiateTotpSetup,
  verifyTotpSetup,
  skip2FASetup,
  type TotpSetupResponse,
  type BackupCodesResponse,
} from '../services/onboarding.service';

type UseInitiateTotpSetupOptions = Omit<UseMutationOptions<TotpSetupResponse, Error, void>, 'mutationFn'>;
type UseVerifyTotpSetupOptions = Omit<UseMutationOptions<BackupCodesResponse, Error, string>, 'mutationFn'>;
type UseSkip2FASetupOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, Error, void>,
  'mutationFn'
>;

export const useInitiateTotpSetup = (options?: UseInitiateTotpSetupOptions) => {
  return useMutation<TotpSetupResponse, Error, void>({
    mutationFn: () => initiateTotpSetup(),
    ...options,
  });
};

export const useVerifyTotpSetup = (options?: UseVerifyTotpSetupOptions) => {
  return useMutation<BackupCodesResponse, Error, string>({
    mutationFn: (token: string) => verifyTotpSetup(token),
    ...options,
  });
};

export const useSkip2FASetup = (options?: UseSkip2FASetupOptions) => {
  return useMutation<{ success: boolean; message: string }, Error, void>({
    mutationFn: () => skip2FASetup(),
    ...options,
  });
};
