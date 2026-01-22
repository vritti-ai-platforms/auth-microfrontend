import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import {
  initiatePasskeySetup,
  verifyPasskeySetup,
  type BackupCodesResponse,
  type RegistrationResponseJSON,
} from "../services/onboarding.service";
import {
  startPasskeyLogin,
  verifyPasskeyLogin,
  type LoginResponse,
  type AuthenticationResponseJSON,
} from "../services/auth.service";

type UsePasskeyRegistrationOptions = Omit<
  UseMutationOptions<BackupCodesResponse, Error, void>,
  "mutationFn"
>;

type UsePasskeyLoginOptions = Omit<
  UseMutationOptions<LoginResponse, Error, string | undefined>,
  "mutationFn"
>;

/**
 * Hook for passkey registration during onboarding
 *
 * Handles the full WebAuthn registration flow:
 * 1. Gets registration options from server
 * 2. Creates credential using browser WebAuthn API (triggers biometric)
 * 3. Verifies credential with server
 *
 * @param options - React Query mutation options
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```typescript
 * const { mutateAsync, isPending, error } = usePasskeyRegistration({
 *   onSuccess: (data) => {
 *     // Show backup codes to user
 *     console.log('Backup codes:', data.backupCodes);
 *   },
 *   onError: (error) => {
 *     console.error('Registration failed:', error.message);
 *   },
 * });
 *
 * // Trigger passkey registration
 * const result = await mutateAsync();
 * ```
 */
export const usePasskeyRegistration = (
  options?: UsePasskeyRegistrationOptions,
) => {
  return useMutation<BackupCodesResponse, Error, void>({
    mutationFn: async () => {
      // 1. Get registration options from server
      const { options: regOptions } = await initiatePasskeySetup();

      // 2. Create credential using browser WebAuthn API
      // This triggers the biometric prompt (Touch ID, Face ID, etc.)
      // @simplewebauthn/browser v13+ expects { optionsJSON: ... } format
      const credential = await startRegistration({
        optionsJSON: regOptions as Parameters<typeof startRegistration>[0]["optionsJSON"],
      });

      // 3. Verify credential with server and get backup codes
      return await verifyPasskeySetup(credential as RegistrationResponseJSON);
    },
    ...options,
  });
};

/**
 * Hook for passkey login (passwordless authentication)
 *
 * Handles the full WebAuthn authentication flow:
 * 1. Gets authentication options from server
 * 2. Gets credential from browser WebAuthn API (triggers biometric)
 * 3. Verifies credential with server and gets access token
 *
 * @param options - React Query mutation options
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```typescript
 * const { mutateAsync, isPending, error } = usePasskeyLogin({
 *   onSuccess: (data) => {
 *     if (data.accessToken) {
 *       setToken(data.accessToken);
 *       scheduleTokenRefresh(data.expiresIn);
 *     }
 *   },
 * });
 *
 * // Trigger passkey login (optionally pass email for filtering)
 * const result = await mutateAsync(undefined); // or mutateAsync('user@example.com')
 * ```
 */
export const usePasskeyLogin = (options?: UsePasskeyLoginOptions) => {
  return useMutation<LoginResponse, Error, string | undefined>({
    mutationFn: async (email?: string) => {
      // 1. Get authentication options from server
      const { options: authOptions, sessionId } =
        await startPasskeyLogin(email);

      // 2. Get credential from browser WebAuthn API
      // This triggers the biometric prompt (Touch ID, Face ID, etc.)
      // @simplewebauthn/browser v13+ expects { optionsJSON: ... } format
      const credential = await startAuthentication({
        optionsJSON: authOptions as Parameters<typeof startAuthentication>[0]["optionsJSON"],
      });

      // 3. Verify credential with server and get session
      return await verifyPasskeyLogin(sessionId, credential as AuthenticationResponseJSON);
    },
    ...options,
  });
};
