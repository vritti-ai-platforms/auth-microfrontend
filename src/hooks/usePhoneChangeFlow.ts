import { useState, useEffect } from 'react';
import { parsePhoneNumber } from 'libphonenumber-js';
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
      // Normalize phone number - remove + and country code prefix
      // The PhoneField returns full number like "+916301216587"
      // Backend expects just digits without country code like "6301216587"
      let normalizedPhone: string;

      try {
        // Try to parse with libphonenumber-js for accurate country code removal
        const phoneNumber = parsePhoneNumber(newPhoneValue, phoneCountry as any);
        normalizedPhone = phoneNumber?.nationalNumber || '';
      } catch {
        // Fallback: manual parsing if libphonenumber-js fails
        // Remove all non-digits first
        const digitsOnly = newPhoneValue.replace(/\D/g, '');

        // Country code length mapping for common countries
        const countryCodeLengths: Record<string, number> = {
          IN: 2,  // +91
          US: 1,  // +1
          CA: 1,  // +1
          GB: 2,  // +44
          AU: 2,  // +61
          CN: 2,  // +86
          JP: 2,  // +81
          DE: 2,  // +49
          FR: 2,  // +33
          BR: 2,  // +55
        };

        const codeLength = countryCodeLengths[phoneCountry] || 0;
        // Only remove country code if we have enough digits
        normalizedPhone = codeLength && digitsOnly.length > 10
          ? digitsOnly.slice(codeLength)
          : digitsOnly;
      }

      const response = await requestChange.mutateAsync({
        changeRequestId: state.changeRequestId,
        newPhone: normalizedPhone,
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
