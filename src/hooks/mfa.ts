import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type {
  AuthenticationResponseJSON,
  BackupCodesResponse,
  LoginResponse,
  PasskeyAuthOptionsResponse,
  PasskeyRegistrationOptionsResponse,
  RegistrationResponseJSON,
  TotpSetupResponse,
} from '../services/auth.service';
import {
  sendSmsCode,
  startPasskeyVerification,
  verifySms,
  verifyPasskeyMfa,
  verifyTotp,
} from '../services/auth.service';
import {
  initiateTotpSetup,
  initiatePasskeySetup,
  verifyPasskeySetup,
  verifyTotpSetup,
  skip2FASetup,
} from '../services/onboarding.service';

// ============================================================================
// MFA Verification Hooks (During Login)
// ============================================================================

/**
 * Hook for verifying TOTP during MFA login flow
 *
 * @param options - Optional mutation options
 * @returns Mutation result with verifyTotp functionality
 */
export const useVerifyTotp = (
  options?: Omit<UseMutationOptions<LoginResponse, Error, { sessionId: string; code: string }>, 'mutationFn'>,
) => {
  return useMutation<LoginResponse, Error, { sessionId: string; code: string }>({
    mutationFn: ({ sessionId, code }) => verifyTotp(sessionId, code),
    ...options,
  });
};

/**
 * Hook for sending SMS code during MFA login flow
 *
 * @param options - Optional mutation options
 * @returns Mutation result with sendSmsCode functionality
 */
export const useSendSmsCode = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>,
) => {
  return useMutation<void, Error, string>({
    mutationFn: (sessionId: string) => sendSmsCode(sessionId),
    ...options,
  });
};

/**
 * Hook for verifying SMS code during MFA login flow
 *
 * @param options - Optional mutation options
 * @returns Mutation result with verifySms functionality
 */
export const useVerifySms = (
  options?: Omit<UseMutationOptions<LoginResponse, Error, { sessionId: string; code: string }>, 'mutationFn'>,
) => {
  return useMutation<LoginResponse, Error, { sessionId: string; code: string }>({
    mutationFn: ({ sessionId, code }) => verifySms(sessionId, code),
    ...options,
  });
};

/**
 * Hook for verifying passkey during MFA login flow
 *
 * @param options - Optional mutation options
 * @returns Mutation result with verifyPasskeyMfa functionality
 */
export const useVerifyPasskey = (
  options?: Omit<UseMutationOptions<LoginResponse, Error, { sessionId: string; credential: AuthenticationResponseJSON }>, 'mutationFn'>,
) => {
  return useMutation<LoginResponse, Error, { sessionId: string; credential: AuthenticationResponseJSON }>({
    mutationFn: ({ sessionId, credential }) => verifyPasskeyMfa(sessionId, credential),
    ...options,
  });
};

// ============================================================================
// MFA Setup Hooks (During Onboarding)
// ============================================================================

/**
 * Hook for initiating TOTP setup during onboarding
 *
 * @param options - Optional mutation options
 * @returns Mutation result with initiateTotpSetup functionality
 */
export const useInitiateTotpSetup = (
  options?: Omit<UseMutationOptions<TotpSetupResponse, Error, void>, 'mutationFn'>,
) => {
  return useMutation<TotpSetupResponse, Error, void>({
    mutationFn: () => initiateTotpSetup(),
    ...options,
  });
};

/**
 * Hook for verifying TOTP setup during onboarding
 *
 * @param options - Optional mutation options
 * @returns Mutation result with verifyTotpSetup functionality
 */
export const useVerifyTotpSetup = (
  options?: Omit<UseMutationOptions<BackupCodesResponse, Error, string>, 'mutationFn'>,
) => {
  return useMutation<BackupCodesResponse, Error, string>({
    mutationFn: (token: string) => verifyTotpSetup(token),
    ...options,
  });
};

/**
 * Hook for skipping 2FA setup during onboarding
 *
 * @param options - Optional mutation options
 * @returns Mutation result with skip2FASetup functionality
 */
export const useSkip2FASetup = (
  options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, void>, 'mutationFn'>,
) => {
  return useMutation<{ success: boolean; message: string }, Error, void>({
    mutationFn: () => skip2FASetup(),
    ...options,
  });
};

/**
 * Hook for passkey registration during onboarding
 *
 * @param options - Optional mutation options
 * @returns Mutation result with initiatePasskeySetup functionality
 */
export const usePasskeyRegistration = (
  options?: Omit<UseMutationOptions<PasskeyRegistrationOptionsResponse, Error, void>, 'mutationFn'>,
) => {
  return useMutation<PasskeyRegistrationOptionsResponse, Error, void>({
    mutationFn: () => initiatePasskeySetup(),
    ...options,
  });
};

/**
 * Hook for passkey login (direct passkey authentication)
 *
 * @param options - Optional mutation options
 * @returns Mutation result with startPasskeyVerification functionality
 */
export const usePasskeyLogin = (
  options?: Omit<UseMutationOptions<PasskeyAuthOptionsResponse, Error, string>, 'mutationFn'>,
) => {
  return useMutation<PasskeyAuthOptionsResponse, Error, string>({
    mutationFn: (sessionId: string) => startPasskeyVerification(sessionId),
    ...options,
  });
};
