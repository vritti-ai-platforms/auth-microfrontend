import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { startAuthentication } from "@simplewebauthn/browser";
import {
  verifyTotp,
  sendSmsCode,
  verifySms,
  startPasskeyVerification,
  verifyPasskeyMfa,
  type LoginResponse,
  type AuthenticationResponseJSON,
} from "../../services/auth.service";

// ============================================================================
// TOTP Verification Hook
// ============================================================================

interface VerifyTotpParams {
  sessionId: string;
  code: string;
}

type UseVerifyTotpOptions = Omit<
  UseMutationOptions<LoginResponse, Error, VerifyTotpParams>,
  "mutationFn"
>;

/**
 * Hook for verifying TOTP code during MFA login
 *
 * @param options - React Query mutation options
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```typescript
 * const { mutateAsync, isPending, error } = useVerifyTotp({
 *   onSuccess: (data) => {
 *     if (data.accessToken) {
 *       setToken(data.accessToken);
 *       scheduleTokenRefresh(data.expiresIn);
 *     }
 *     navigate('/dashboard');
 *   },
 * });
 *
 * await mutateAsync({ sessionId, code: '123456' });
 * ```
 */
export const useVerifyTotp = (options?: UseVerifyTotpOptions) => {
  return useMutation<LoginResponse, Error, VerifyTotpParams>({
    mutationFn: ({ sessionId, code }) => verifyTotp(sessionId, code),
    ...options,
  });
};

// ============================================================================
// SMS Verification Hooks
// ============================================================================

type UseSendSmsCodeOptions = Omit<
  UseMutationOptions<void, Error, string>,
  "mutationFn"
>;

/**
 * Hook for sending SMS verification code during MFA login
 *
 * @param options - React Query mutation options
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```typescript
 * const { mutateAsync, isPending, error } = useSendSmsCode({
 *   onSuccess: () => {
 *     setCodeSent(true);
 *   },
 * });
 *
 * await mutateAsync(sessionId);
 * ```
 */
export const useSendSmsCode = (options?: UseSendSmsCodeOptions) => {
  return useMutation<void, Error, string>({
    mutationFn: (sessionId: string) => sendSmsCode(sessionId),
    ...options,
  });
};

interface VerifySmsParams {
  sessionId: string;
  code: string;
}

type UseVerifySmsOptions = Omit<
  UseMutationOptions<LoginResponse, Error, VerifySmsParams>,
  "mutationFn"
>;

/**
 * Hook for verifying SMS code during MFA login
 *
 * @param options - React Query mutation options
 * @returns Mutation object with mutate/mutateAsync functions
 *
 * @example
 * ```typescript
 * const { mutateAsync, isPending, error } = useVerifySms({
 *   onSuccess: (data) => {
 *     if (data.accessToken) {
 *       setToken(data.accessToken);
 *       scheduleTokenRefresh(data.expiresIn);
 *     }
 *     navigate('/dashboard');
 *   },
 * });
 *
 * await mutateAsync({ sessionId, code: '123456' });
 * ```
 */
export const useVerifySms = (options?: UseVerifySmsOptions) => {
  return useMutation<LoginResponse, Error, VerifySmsParams>({
    mutationFn: ({ sessionId, code }) => verifySms(sessionId, code),
    ...options,
  });
};

// ============================================================================
// Passkey Verification Hook
// ============================================================================

type UseVerifyPasskeyOptions = Omit<
  UseMutationOptions<LoginResponse, Error, string>,
  "mutationFn"
>;

/**
 * Hook for verifying passkey during MFA login
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
 * const { mutateAsync, isPending, error } = useVerifyPasskey({
 *   onSuccess: (data) => {
 *     if (data.accessToken) {
 *       setToken(data.accessToken);
 *       scheduleTokenRefresh(data.expiresIn);
 *     }
 *     navigate('/dashboard');
 *   },
 * });
 *
 * // Trigger passkey verification with MFA session ID
 * await mutateAsync(mfaSessionId);
 * ```
 */
export const useVerifyPasskey = (options?: UseVerifyPasskeyOptions) => {
  return useMutation<LoginResponse, Error, string>({
    mutationFn: async (mfaSessionId: string) => {
      // 1. Get authentication options from server
      const { options: authOptions } =
        await startPasskeyVerification(mfaSessionId);

      // 2. Get credential from browser WebAuthn API
      // This triggers the biometric prompt (Touch ID, Face ID, etc.)
      // @simplewebauthn/browser v13+ expects { optionsJSON: ... } format
      const credential = await startAuthentication({
        optionsJSON:
          authOptions as Parameters<typeof startAuthentication>[0]["optionsJSON"],
      });

      // 3. Verify credential with server and get session
      // Use the original mfaSessionId (not from response)
      return await verifyPasskeyMfa(
        mfaSessionId,
        credential as AuthenticationResponseJSON,
      );
    },
    ...options,
  });
};
