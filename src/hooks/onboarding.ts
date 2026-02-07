import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type {
  BackupCodesResponse,
  OnboardingStatusResponse,
  PasskeyRegistrationOptionsResponse,
  RegisterDto,
  RegistrationResponseJSON,
  SetPasswordResponse,
  StartOnboardingResponse,
  TotpSetupResponse,
} from '../services/onboarding.service';
import {
  initiateTotpSetup,
  initiatePasskeySetup,
  register,
  resendEmailOtp,
  setPassword,
  skip2FASetup,
  startOnboarding,
  verifyEmail,
  verifyPasskeySetup,
  verifyTotpSetup,
} from '../services/onboarding.service';

/**
 * Hook for user registration
 *
 * @param options - Optional mutation options
 * @returns Mutation result with register functionality
 */
export const useRegister = (
  options?: Omit<UseMutationOptions<OnboardingStatusResponse, Error, RegisterDto>, 'mutationFn'>,
) => {
  return useMutation<OnboardingStatusResponse, Error, RegisterDto>({
    mutationFn: (data: RegisterDto) => register(data),
    ...options,
  });
};

/**
 * Hook for email verification during onboarding
 *
 * @param options - Optional mutation options
 * @returns Mutation result with verifyEmail functionality
 */
export const useVerifyEmail = (
  options?: Omit<UseMutationOptions<OnboardingStatusResponse, Error, string>, 'mutationFn'>,
) => {
  return useMutation<OnboardingStatusResponse, Error, string>({
    mutationFn: (otp: string) => verifyEmail(otp),
    ...options,
  });
};

/**
 * Hook for resending email OTP
 *
 * @param options - Optional mutation options
 * @returns Mutation result with resendEmailOtp functionality
 */
export const useResendEmailOtp = (
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>,
) => {
  return useMutation<void, Error, void>({
    mutationFn: () => resendEmailOtp(),
    ...options,
  });
};

/**
 * Hook for starting onboarding process
 *
 * @param options - Optional mutation options
 * @returns Mutation result with startOnboarding functionality
 */
export const useStartOnboarding = (
  options?: Omit<UseMutationOptions<StartOnboardingResponse, Error, void>, 'mutationFn'>,
) => {
  return useMutation<StartOnboardingResponse, Error, void>({
    mutationFn: () => startOnboarding(),
    ...options,
  });
};

/**
 * Hook for setting password (OAuth users)
 *
 * @param options - Optional mutation options
 * @returns Mutation result with setPassword functionality
 */
export const useSetPassword = (
  options?: Omit<UseMutationOptions<SetPasswordResponse, Error, string>, 'mutationFn'>,
) => {
  return useMutation<SetPasswordResponse, Error, string>({
    mutationFn: (password: string) => setPassword(password),
    ...options,
  });
};

/**
 * Hook for initiating TOTP setup
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
 * Hook for verifying TOTP setup
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
 * Hook for skipping 2FA setup
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
 * Hook for initiating passkey setup
 *
 * @param options - Optional mutation options
 * @returns Mutation result with initiatePasskeySetup functionality
 */
export const useInitiatePasskeySetup = (
  options?: Omit<UseMutationOptions<PasskeyRegistrationOptionsResponse, Error, void>, 'mutationFn'>,
) => {
  return useMutation<PasskeyRegistrationOptionsResponse, Error, void>({
    mutationFn: () => initiatePasskeySetup(),
    ...options,
  });
};

/**
 * Hook for verifying passkey setup
 *
 * @param options - Optional mutation options
 * @returns Mutation result with verifyPasskeySetup functionality
 */
export const useVerifyPasskeySetup = (
  options?: Omit<UseMutationOptions<BackupCodesResponse, Error, RegistrationResponseJSON>, 'mutationFn'>,
) => {
  return useMutation<BackupCodesResponse, Error, RegistrationResponseJSON>({
    mutationFn: (credential: RegistrationResponseJSON) => verifyPasskeySetup(credential),
    ...options,
  });
};
