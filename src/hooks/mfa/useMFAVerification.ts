import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
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

export function useVerifyTotp(options?: UseVerifyTotpOptions) {
  return useMutation<LoginResponse, Error, VerifyTotpParams>({
    mutationFn: ({ sessionId, code }) => verifyTotp(sessionId, code),
    ...options,
  });
}

// ============================================================================
// SMS Verification Hooks
// ============================================================================

type UseSendSmsCodeOptions = Omit<
  UseMutationOptions<void, Error, string>,
  "mutationFn"
>;

export function useSendSmsCode(options?: UseSendSmsCodeOptions) {
  return useMutation<void, Error, string>({
    mutationFn: sendSmsCode,
    ...options,
  });
}

interface VerifySmsParams {
  sessionId: string;
  code: string;
}

type UseVerifySmsOptions = Omit<
  UseMutationOptions<LoginResponse, Error, VerifySmsParams>,
  "mutationFn"
>;

export function useVerifySms(options?: UseVerifySmsOptions) {
  return useMutation<LoginResponse, Error, VerifySmsParams>({
    mutationFn: ({ sessionId, code }) => verifySms(sessionId, code),
    ...options,
  });
}

// ============================================================================
// Passkey Verification Hook
// ============================================================================

type UseVerifyPasskeyOptions = Omit<
  UseMutationOptions<LoginResponse, Error, string>,
  "mutationFn"
>;

export function useVerifyPasskey(options?: UseVerifyPasskeyOptions) {
  return useMutation<LoginResponse, Error, string>({
    mutationFn: async (mfaSessionId: string) => {
      const { options: authOptions } =
        await startPasskeyVerification(mfaSessionId);

      const credential = await startAuthentication({
        optionsJSON:
          authOptions as Parameters<typeof startAuthentication>[0]["optionsJSON"],
      });

      return await verifyPasskeyMfa(
        mfaSessionId,
        credential as AuthenticationResponseJSON,
      );
    },
    ...options,
  });
}
