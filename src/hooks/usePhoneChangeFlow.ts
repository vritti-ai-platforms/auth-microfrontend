import { useState, useEffect } from 'react';
import { usePhoneVerification } from './usePhoneVerification';

export type PhoneChangeStep = 'identity' | 'newPhone' | 'verify' | 'success';

export interface PhoneChangeFlowState {
  step: PhoneChangeStep;
  currentPhone: string;
  currentCountry: string;
  newPhone: string;
  newPhoneCountry: string;
  identityVerificationId: string;
  changeRequestId: string;
  changeVerificationId: string;
  changeRequestsToday: number;
  revertToken: string;
  error: string | null;
}

export function usePhoneChangeFlow(currentPhone: string, currentCountry: string) {
  const [state, setState] = useState<PhoneChangeFlowState>({
    step: 'identity',
    currentPhone,
    currentCountry,
    newPhone: '',
    newPhoneCountry: 'IN',
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
  } = usePhoneVerification();

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
        step: 'newPhone',
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Invalid verification code',
      }));
    }
  };

  // Step 3: Request phone change
  const submitNewPhone = async (newPhoneValue: string, phoneCountry: string) => {
    clearError();
    try {
      const response = await requestChange.mutateAsync({
        changeRequestId: state.changeRequestId,
        newPhone: newPhoneValue,
        phoneCountry,
      });
      setState((prev) => ({
        ...prev,
        newPhone: newPhoneValue,
        newPhoneCountry: phoneCountry,
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

  // Step 4: Verify new phone OTP
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
          ? 'newPhone'
          : prev.step === 'newPhone'
            ? 'identity'
            : prev.step,
    }));
  };

  // Reset flow
  const reset = () => {
    setState({
      step: 'identity',
      currentPhone,
      currentCountry,
      newPhone: '',
      newPhoneCountry: 'IN',
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
    submitNewPhone,
    submitVerificationCode,
    handleResendOtp,
    goBack,
    reset,
    clearError,
  };
}
