import {
  type BackupCodesResponse,
  initiatePasskeySetup,
  initiateTotpSetup,
  type RegistrationResponseJSON,
  skipMFASetup,
  type TotpSetupResponse,
  verifyPasskeySetup,
  verifyTotpSetup,
} from '@services/onboarding.service';
import { startRegistration } from '@simplewebauthn/browser';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseInitiateTotpSetupOptions = Omit<UseMutationOptions<TotpSetupResponse, AxiosError, void>, 'mutationFn'>;
type UseVerifyTotpSetupOptions = Omit<UseMutationOptions<BackupCodesResponse, AxiosError, string>, 'mutationFn'>;
type UseSkipMFASetupOptions = Omit<UseMutationOptions<{ success: boolean; message: string }, AxiosError, void>, 'mutationFn'>;
type UsePasskeyRegistrationOptions = Omit<UseMutationOptions<BackupCodesResponse, AxiosError, void>, 'mutationFn'>;

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

export function useSkipMFASetup(options?: UseSkipMFASetupOptions) {
  return useMutation<{ success: boolean; message: string }, AxiosError, void>({
    mutationFn: skipMFASetup,
    ...options,
  });
}

export function usePasskeyRegistration(options?: UsePasskeyRegistrationOptions) {
  return useMutation<BackupCodesResponse, AxiosError, void>({
    mutationFn: async () => {
      const { options: regOptions } = await initiatePasskeySetup();
      const credential = await startRegistration({
        optionsJSON: regOptions as Parameters<typeof startRegistration>[0]['optionsJSON'],
      });
      return await verifyPasskeySetup(credential as RegistrationResponseJSON);
    },
    ...options,
  });
}

