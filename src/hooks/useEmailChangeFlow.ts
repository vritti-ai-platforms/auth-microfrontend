import { useState, useEffect } from 'react';
import { useEmailVerification } from './useEmailVerification';

export type EmailChangeStep = 'identity' | 'newEmail' | 'verify' | 'success';

export interface EmailChangeFlowState {
  step: EmailChangeStep;
  currentEmail: string;
  newEmail: string;
  identityVerificationId: string;
  changeRequestId: string;
  changeVerificationId: string;
  changeRequestsToday: number;
  revertToken: string;
  error: string | null;
}

export function useEmailChangeFlow(currentEmail: string) {
  const [state, setState] = useState<EmailChangeFlowState>({
    step: 'identity',
    currentEmail,
    newEmail: '',
    identityVerificationId: '',
    changeRequestId: '',
    changeVerificationId: '',
    changeRequestsToday: 0,
    revertToken: '',
    error: null,
  });

  const [resendTimer, setResendTimer] = useState(0);

  const {
    requestIdentityVerification,
    verifyIdentity,
    requestChange,
    verifyChange,
    resendOtp,
  } = useEmailVerification();

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Step 1: Request identity verification
  const startFlow = async () => {
    clearError();
    try {
      const response = await requestIdentityVerification.mutateAsync();
      setState((prev) => ({
        ...prev,
        identityVerificationId: response.verificationId,
        step: 'identity',
      }));
      setResendTimer(45);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to send verification code',
      }));
    }
  };

  // Step 2: Verify identity OTP
  const submitIdentityCode = async (code: string) => {
    clearError();
    try {
      const response = await verifyIdentity.mutateAsync({
        verificationId: state.identityVerificationId,
        otpCode: code,
      });
      setState((prev) => ({
        ...prev,
        changeRequestId: response.changeRequestId,
        changeRequestsToday: response.changeRequestsToday,
        step: 'newEmail',
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Invalid verification code',
      }));
    }
  };

  // Step 3: Request email change
  const submitNewEmail = async (newEmailValue: string) => {
    clearError();
    try {
      const response = await requestChange.mutateAsync({
        changeRequestId: state.changeRequestId,
        newEmail: newEmailValue,
      });
      setState((prev) => ({
        ...prev,
        newEmail: newEmailValue,
        changeVerificationId: response.verificationId,
        step: 'verify',
      }));
      setResendTimer(45);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to send verification code',
      }));
    }
  };

  // Step 4: Verify new email OTP
  const submitVerificationCode = async (code: string) => {
    clearError();
    try {
      const response = await verifyChange.mutateAsync({
        changeRequestId: state.changeRequestId,
        verificationId: state.changeVerificationId,
        otpCode: code,
      });
      setState((prev) => ({
        ...prev,
        revertToken: response.revertToken,
        step: 'success',
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Invalid verification code',
      }));
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    clearError();
    try {
      const verificationId =
        state.step === 'identity'
          ? state.identityVerificationId
          : state.changeVerificationId;
      await resendOtp.mutateAsync({ verificationId });
      setResendTimer(45);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to resend code',
      }));
    }
  };

  // Go back one step
  const goBack = () => {
    clearError();
    setState((prev) => ({
      ...prev,
      step:
        prev.step === 'verify'
          ? 'newEmail'
          : prev.step === 'newEmail'
            ? 'identity'
            : prev.step,
    }));
  };

  // Reset flow
  const reset = () => {
    setState({
      step: 'identity',
      currentEmail,
      newEmail: '',
      identityVerificationId: '',
      changeRequestId: '',
      changeVerificationId: '',
      changeRequestsToday: 0,
      revertToken: '',
      error: null,
    });
    setResendTimer(0);
  };

  return {
    state,
    resendTimer,
    startFlow,
    submitIdentityCode,
    submitNewEmail,
    submitVerificationCode,
    handleResendOtp,
    goBack,
    reset,
    clearError,
  };
}
