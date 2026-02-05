import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type {
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyResetOtpResponse,
} from '../services/auth.service';
import {
  forgotPassword,
  resetPassword,
  verifyResetOtp,
} from '../services/auth.service';

/**
 * Hook for requesting password reset
 *
 * @param options - Optional mutation options
 * @returns Mutation result with forgotPassword functionality
 */
export const useForgotPassword = (
  options?: Omit<UseMutationOptions<ForgotPasswordResponse, Error, string>, 'mutationFn'>,
) => {
  return useMutation<ForgotPasswordResponse, Error, string>({
    mutationFn: (email: string) => forgotPassword(email),
    ...options,
  });
};

/**
 * Hook for verifying password reset OTP
 *
 * @param options - Optional mutation options
 * @returns Mutation result with verifyResetOtp functionality
 */
export const useVerifyResetOtp = (
  options?: Omit<UseMutationOptions<VerifyResetOtpResponse, Error, { email: string; otp: string }>, 'mutationFn'>,
) => {
  return useMutation<VerifyResetOtpResponse, Error, { email: string; otp: string }>({
    mutationFn: ({ email, otp }) => verifyResetOtp(email, otp),
    ...options,
  });
};

/**
 * Hook for resetting password
 *
 * @param options - Optional mutation options
 * @returns Mutation result with resetPassword functionality
 */
export const useResetPassword = (
  options?: Omit<UseMutationOptions<ResetPasswordResponse, Error, { resetToken: string; newPassword: string }>, 'mutationFn'>,
) => {
  return useMutation<ResetPasswordResponse, Error, { resetToken: string; newPassword: string }>({
    mutationFn: ({ resetToken, newPassword }) => resetPassword(resetToken, newPassword),
    ...options,
  });
};

/**
 * Password reset flow steps
 */
export type Step = 'email' | 'otp' | 'reset' | 'success';

/**
 * Password reset flow state and actions
 */
export interface PasswordResetFlow {
  step: Step;
  email: string;
  resetToken: string;
  error: string | null;
  submitEmail: (email: string) => Promise<void>;
  submitOtp: (otp: string) => Promise<void>;
  submitPassword: (password: string) => Promise<void>;
  goBack: () => void;
  clearError: () => void;
}

/**
 * Hook for managing password reset flow state
 *
 * Provides a complete password reset flow with step management.
 * Automatically advances through steps: email -> otp -> reset -> success
 *
 * @returns Password reset flow state and actions
 *
 * @example
 * ```typescript
 * const {
 *   step,
 *   email,
 *   error,
 *   submitEmail,
 *   submitOtp,
 *   submitPassword,
 *   goBack,
 *   clearError,
 * } = usePasswordResetFlow();
 *
 * // Step 1: Submit email
 * await submitEmail('user@example.com');
 *
 * // Step 2: Verify OTP
 * await submitOtp('123456');
 *
 * // Step 3: Reset password
 * await submitPassword('NewSecurePass123!');
 *
 * // Step 4: Success (automatic)
 * ```
 */
export function usePasswordResetFlow(): PasswordResetFlow {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyResetOtp();
  const resetPasswordMutation = useResetPassword();

  const clearError = () => {
    setError(null);
  };

  const submitEmail = async (emailValue: string) => {
    clearError();
    try {
      await forgotPasswordMutation.mutateAsync(emailValue);
      setEmail(emailValue);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code');
    }
  };

  const submitOtp = async (otp: string) => {
    clearError();
    try {
      const response = await verifyOtpMutation.mutateAsync({ email, otp });
      setResetToken(response.resetToken);
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    }
  };

  const submitPassword = async (password: string) => {
    clearError();
    try {
      await resetPasswordMutation.mutateAsync({ resetToken, newPassword: password });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  const goBack = () => {
    clearError();
    if (step === 'otp') {
      setStep('email');
    } else if (step === 'reset') {
      setStep('otp');
    }
  };

  return {
    step,
    email,
    resetToken,
    error,
    submitEmail,
    submitOtp,
    submitPassword,
    goBack,
    clearError,
  };
}
