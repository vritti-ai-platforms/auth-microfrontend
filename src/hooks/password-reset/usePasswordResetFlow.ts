import { useState } from 'react';
import { useForgotPassword } from './useForgotPassword';
import { useResetPassword } from './useResetPassword';
import { useVerifyResetOtp } from './useVerifyResetOtp';

export type Step = 'email' | 'otp' | 'reset' | 'success';

export function usePasswordResetFlow() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyResetOtp();
  const resetPasswordMutation = useResetPassword();

  const clearError = () => setError(null);

  const submitEmail = async (emailValue: string) => {
    clearError();
    try {
      await forgotPasswordMutation.mutateAsync(emailValue);
      setEmail(emailValue);
      setStep('otp');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send reset code. Please try again.';
      setError(message);
    }
  };

  const submitOtp = async (otp: string) => {
    clearError();
    try {
      const result = await verifyOtpMutation.mutateAsync({ email, otp });
      setResetToken(result.resetToken);
      setStep('reset');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid or expired code. Please try again.';
      setError(message);
    }
  };

  const submitPassword = async (password: string) => {
    clearError();
    try {
      await resetPasswordMutation.mutateAsync({
        resetToken,
        newPassword: password,
      });
      setStep('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setError(message);
    }
  };

  const resendOtp = async () => {
    clearError();
    try {
      await forgotPasswordMutation.mutateAsync(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend code. Please try again.';
      setError(message);
    }
  };

  const goBack = () => {
    clearError();
    if (step === 'otp') {
      setStep('email');
    }
  };

  return {
    // State
    step,
    email,
    error,
    // Mutations (for isPending states)
    forgotPasswordMutation,
    verifyOtpMutation,
    resetPasswordMutation,
    // Actions
    submitEmail,
    submitOtp,
    submitPassword,
    resendOtp,
    goBack,
    clearError,
  };
}

export type PasswordResetFlow = ReturnType<typeof usePasswordResetFlow>;
