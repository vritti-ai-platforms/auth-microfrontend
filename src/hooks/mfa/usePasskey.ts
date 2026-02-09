import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import {
  initiatePasskeySetup,
  verifyPasskeySetup,
  type BackupCodesResponse,
  type RegistrationResponseJSON,
} from "../../services/onboarding.service";
import {
  startPasskeyLogin,
  verifyPasskeyLogin,
  type LoginResponse,
  type AuthenticationResponseJSON,
} from "../../services/auth.service";

type UsePasskeyRegistrationOptions = Omit<
  UseMutationOptions<BackupCodesResponse, Error, void>,
  "mutationFn"
>;

type UsePasskeyLoginOptions = Omit<
  UseMutationOptions<LoginResponse, Error, string | undefined>,
  "mutationFn"
>;

export function usePasskeyRegistration(options?: UsePasskeyRegistrationOptions) {
  return useMutation<BackupCodesResponse, Error, void>({
    mutationFn: async () => {
      const { options: regOptions } = await initiatePasskeySetup();

      const credential = await startRegistration({
        optionsJSON: regOptions as Parameters<typeof startRegistration>[0]["optionsJSON"],
      });

      return await verifyPasskeySetup(credential as RegistrationResponseJSON);
    },
    ...options,
  });
}

export function usePasskeyLogin(options?: UsePasskeyLoginOptions) {
  return useMutation<LoginResponse, Error, string | undefined>({
    mutationFn: async (email?: string) => {
      const { options: authOptions, sessionId } =
        await startPasskeyLogin(email);

      const credential = await startAuthentication({
        optionsJSON: authOptions as Parameters<typeof startAuthentication>[0]["optionsJSON"],
      });

      return await verifyPasskeyLogin(sessionId, credential as AuthenticationResponseJSON);
    },
    ...options,
  });
}
