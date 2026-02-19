import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  type BackupCodesResponse,
  initiateTotpSetup,
  skip2FASetup,
  type TotpSetupResponse,
  verifyTotpSetup,
} from '../../services/onboarding.service';

type UseInitiateTotpSetupOptions = Omit<UseMutationOptions<TotpSetupResponse, AxiosError, void>, 'mutationFn'>;
type UseVerifyTotpSetupOptions = Omit<UseMutationOptions<BackupCodesResponse, AxiosError, string>, 'mutationFn'>;
type UseSkip2FASetupOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, AxiosError, void>,
  'mutationFn'
>;

export function useInitiateTotpSetup(options?: UseInitiateTotpSetupOptions) {
  return useMutation<TotpSetupResponse, AxiosError, void>({
    mutationFn: initiateTotpSetup,
    ...options,
  });
}

export function useVerifyTotpSetup(options?: UseVerifyTotpSetupOptions) {
  return useMutation<BackupCodesResponse, AxiosError, string>({
    mutationFn: verifyTotpSetup,
    ...options,
  });
}

export function useSkip2FASetup(options?: UseSkip2FASetupOptions) {
  return useMutation<{ success: boolean; message: string }, AxiosError, void>({
    mutationFn: skip2FASetup,
    ...options,
  });
}
