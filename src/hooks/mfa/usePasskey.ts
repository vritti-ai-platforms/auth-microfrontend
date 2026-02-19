import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import {
  type AuthenticationResponseJSON,
  type LoginResponse,
  startPasskeyLogin,
  verifyPasskeyLogin,
} from '../../services/auth.service';
import {
  type BackupCodesResponse,
  initiatePasskeySetup,
  type RegistrationResponseJSON,
  verifyPasskeySetup,
} from '../../services/onboarding.service';

type UsePasskeyRegistrationOptions = Omit<UseMutationOptions<BackupCodesResponse, AxiosError, void>, 'mutationFn'>;

type UsePasskeyLoginOptions = Omit<UseMutationOptions<LoginResponse, AxiosError, string | undefined>, 'mutationFn'>;

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

export function usePasskeyLogin(options?: UsePasskeyLoginOptions) {
  return useMutation<LoginResponse, AxiosError, string | undefined>({
    mutationFn: async (email?: string) => {
      const { options: authOptions, sessionId } = await startPasskeyLogin(email);

      const credential = await startAuthentication({
        optionsJSON: authOptions as Parameters<typeof startAuthentication>[0]['optionsJSON'],
      });

      return await verifyPasskeyLogin(sessionId, credential as AuthenticationResponseJSON);
    },
    ...options,
  });
}
