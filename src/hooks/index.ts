// Utility hooks
export { useResendTimer } from './useResendTimer';

// Auth hooks
export { useSignup, useLogin } from './auth';

// Onboarding hooks
export {
  useRegister,
  useVerifyEmail,
  useResendEmailOtp,
  useStartOnboarding,
  useSetPassword,
} from './onboarding';

// Mobile verification hooks
export {
  useInitiateMobileVerification,
  useMobileVerificationStatus,
  useVerifyMobileOtp,
  useResendMobileVerification,
  useMobileVerificationSSE,
  useMobileVerificationRealtime,
} from './mobile-verification';

// MFA hooks (2FA, passkey, verification)
export {
  useInitiateTotpSetup,
  useVerifyTotpSetup,
  useSkip2FASetup,
  usePasskeyRegistration,
  usePasskeyLogin,
  useVerifyTotp,
  useSendSmsCode,
  useVerifySms,
  useVerifyPasskey,
} from './mfa';

// Password reset hooks
export {
  useForgotPassword,
  useVerifyResetOtp,
  useResetPassword,
  usePasswordResetFlow,
  type PasswordResetFlow,
  type Step,
} from './password-reset';
