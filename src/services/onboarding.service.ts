import { axios } from "@vritti/quantum-ui/axios";

export interface OnboardingStatusResponse {
  email: string;
  currentStep: string;
  onboardingComplete: boolean;
  signupMethod: 'email' | 'oauth';
}

export interface VerifyEmailDto {
  otp: string;
}

// Verifies user's email address using OTP code
export function verifyEmail(otp: string): Promise<OnboardingStatusResponse> {
  return axios
    .post<OnboardingStatusResponse>("cloud-api/onboarding/email-verification/verify-otp", { otp }, {
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Retrieves current onboarding status for the authenticated user
export function getStatus(): Promise<OnboardingStatusResponse> {
  return axios
    .get<OnboardingStatusResponse>("cloud-api/onboarding/status")
    .then((r) => r.data);
}

export interface SendEmailOtpResponse {
  success: boolean;
  message: string;
}

// Sends initial email verification OTP for email signup users
export function sendEmailOtp(): Promise<SendEmailOtpResponse> {
  return axios
    .post<SendEmailOtpResponse>("cloud-api/onboarding/email-verification/send-otp")
    .then((r) => r.data);
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
}

// Sets password for OAuth users during onboarding
export function setPassword(password: string): Promise<SetPasswordResponse> {
  return axios
    .post<SetPasswordResponse>("cloud-api/onboarding/set-password", { password })
    .then((r) => r.data);
}

// ============================================================================
// Two-Factor Authentication (2FA) API Functions
// ============================================================================

export interface TotpSetupResponse {
  qrCodeDataUrl: string;
  manualSetupKey: string;
  issuer: string;
  accountName: string;
}

export interface BackupCodesResponse {
  success: boolean;
  message: string;
  backupCodes: string[];
  warning: string;
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean;
  method: string | null;
  backupCodesRemaining: number;
  lastUsedAt: string | null;
  createdAt: string | null;
}

// Initiates TOTP setup and returns QR code for authenticator apps
export function initiateTotpSetup(): Promise<TotpSetupResponse> {
  return axios
    .post<TotpSetupResponse>("cloud-api/onboarding/2fa/totp/setup")
    .then((r) => r.data);
}

// Verifies TOTP setup with a 6-digit code and returns backup codes
export function verifyTotpSetup(token: string): Promise<BackupCodesResponse> {
  return axios
    .post<BackupCodesResponse>("cloud-api/onboarding/2fa/totp/verify", { token })
    .then((r) => r.data);
}

// Skips 2FA setup and completes onboarding without MFA
export function skip2FASetup(): Promise<{ success: boolean; message: string }> {
  return axios
    .post<{ success: boolean; message: string }>("cloud-api/onboarding/2fa/skip")
    .then((r) => r.data);
}

// Gets current 2FA status for the authenticated user
export function get2FAStatus(): Promise<TwoFactorStatusResponse> {
  return axios
    .get<TwoFactorStatusResponse>("cloud-api/onboarding/2fa/status")
    .then((r) => r.data);
}

// ============================================================================
// Passkey (WebAuthn) 2FA API Functions
// ============================================================================

export interface PasskeyRegistrationOptionsResponse {
  options: PublicKeyCredentialCreationOptions;
}

export interface PublicKeyCredentialCreationOptions {
  rp: { name: string; id?: string };
  user: { id: string; name: string; displayName: string };
  challenge: string;
  pubKeyCredParams: Array<{ alg: number; type: "public-key" }>;
  timeout?: number;
  excludeCredentials?: Array<{
    id: string;
    type: "public-key";
    transports?: string[];
  }>;
  authenticatorSelection?: {
    authenticatorAttachment?: "platform" | "cross-platform";
    residentKey?: "discouraged" | "preferred" | "required";
    requireResidentKey?: boolean;
    userVerification?: "discouraged" | "preferred" | "required";
  };
  attestation?: "none" | "indirect" | "direct" | "enterprise";
}

export interface RegistrationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
  authenticatorAttachment?: "platform" | "cross-platform";
  clientExtensionResults: Record<string, unknown>;
  type: "public-key";
}

// Initiates Passkey setup and returns WebAuthn registration options
export function initiatePasskeySetup(): Promise<PasskeyRegistrationOptionsResponse> {
  return axios
    .post<PasskeyRegistrationOptionsResponse>("cloud-api/onboarding/2fa/passkey/setup")
    .then((r) => r.data);
}

// Verifies Passkey setup with browser credential and returns backup codes
export function verifyPasskeySetup(credential: RegistrationResponseJSON): Promise<BackupCodesResponse> {
  return axios
    .post<BackupCodesResponse>("cloud-api/onboarding/2fa/passkey/verify", { credential })
    .then((r) => r.data);
}

// ============================================================================
// Mobile Verification
// ============================================================================

export type VerificationMethod = 'whatsapp' | 'sms' | 'manual';

export interface InitiateMobileVerificationDto {
  phone?: string;
  phoneCountry?: string;
  method: VerificationMethod;
}

export interface MobileVerificationStatusResponse {
  verificationId: string;
  method: VerificationMethod;
  verificationToken?: string;
  isVerified: boolean;
  phone?: string | null;
  phoneCountry?: string | null;
  expiresAt: string;
  message: string;
  instructions?: string;
  whatsappNumber?: string;
}

// Initiates mobile verification for the authenticated user
export function initiateMobileVerification(data: InitiateMobileVerificationDto): Promise<MobileVerificationStatusResponse> {
  return axios
    .post<MobileVerificationStatusResponse>("cloud-api/onboarding/mobile-verification/initiate", data)
    .then((r) => r.data);
}

// Gets the current mobile verification status
export function getMobileVerificationStatus(): Promise<MobileVerificationStatusResponse> {
  return axios
    .get<MobileVerificationStatusResponse>("cloud-api/onboarding/mobile-verification/status")
    .then((r) => r.data);
}

// Verifies mobile number using OTP entered by user
export function verifyMobileOtp(otp: string): Promise<{ success: boolean; message: string }> {
  return axios
    .post<{ success: boolean; message: string }>("cloud-api/onboarding/mobile-verification/verify-otp", { otp })
    .then((r) => r.data);
}
