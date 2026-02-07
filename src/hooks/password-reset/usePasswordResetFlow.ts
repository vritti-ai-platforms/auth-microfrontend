import { useState } from 'react';
import { useForgotPassword } from './useForgotPassword';
import { useResetPassword } from './useResetPassword';
import { useVerifyResetOtp } from './useVerifyResetOtp';

export type Step = 'email' | 'otp' | 'reset' | 'success';

export function usePasswordResetFlow() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Mutations with onSuccess callbacks for step transitions
  const forgotPasswordMutation = useForgotPassword({
    onSuccess: (_, emailValue) => {
      setEmail(emailValue);
      setStep('otp');
    },
  });

  const verifyOtpMutation = useVerifyResetOtp({
    onSuccess: (result) => {
      setResetToken(result.resetToken);
      setStep('reset');
    },
  });

  const resetPasswordMutation = useResetPassword({
    onSuccess: () => {
      setStep('success');
    },
  });

  // Resend OTP reuses forgotPassword mutation (no step change needed)
  const resendOtp = async () => {
    await forgotPasswordMutation.mutateAsync(email);
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('email');
    }
  };

  return {
    // State
    step,
    email,
    resetToken,
    // Mutations (for Form component integration)
    forgotPasswordMutation,
    verifyOtpMutation,
    resetPasswordMutation,
    // Actions
    resendOtp,
    goBack,
  };
}

export type PasswordResetFlow = ReturnType<typeof usePasswordResetFlow>;
