import { axios } from "@vritti/quantum-ui/axios";
import type { AxiosResponse } from "axios";

/**
 * User registration data transfer object
 */
export interface RegisterDto {
  /** User's email address */
  email: string;
  /** User's password (must meet security requirements) */
  password: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
}

/**
 * Onboarding status response from the API
 * Contains current user onboarding state and progress
 * Note: accessToken is only returned on initial registration, not on status fetches
 */
export interface OnboardingStatusResponse {
  /** Unique user identifier */
  userId: string;
  /** User's email address */
  email: string;
  /** User's first name (nullable) */
  firstName?: string | null;
  /** User's last name (nullable) */
  lastName?: string | null;
  /** Current step in the onboarding process */
  currentStep: string;
  /** Whether onboarding is fully completed */
  onboardingComplete: boolean;
  /** Current account status (active, pending, etc.) */
  accountStatus: string;
  /** Whether email has been verified */
  emailVerified: boolean;
  /** Whether phone has been verified */
  phoneVerified: boolean;
}

/**
 * Email OTP verification data transfer object
 */
export interface VerifyEmailDto {
  /** 6-digit OTP code sent to user's email */
  otp: string;
}

/**
 * Registers a new user and initiates the onboarding process
 *
 * Note: This function is for direct API calls. For full auth flow with token
 * handling, use the signup function from auth.service.ts instead.
 *
 * @param data - User registration information
 * @returns Promise resolving to onboarding status
 * @throws Error if registration fails (email exists, validation errors, etc.)
 *
 * @example
 * ```typescript
 * import { register } from './services/onboarding.service';
 *
 * try {
 *   const response = await register({
 *     email: 'user@example.com',
 *     password: 'SecurePass123!',
 *     firstName: 'John',
 *     lastName: 'Doe'
 *   });
 *
 *   console.log('Registration successful:', response.currentStep);
 * } catch (error) {
 *   console.error('Registration failed:', error);
 * }
 * ```
 */
export async function register(
  data: RegisterDto,
): Promise<OnboardingStatusResponse> {
  const response: AxiosResponse<OnboardingStatusResponse> = await axios.post(
    "cloud-api/onboarding/register",
    data,
    { public: true }, // Bypass token recovery for public auth endpoint
  );

  return response.data;
}

/**
 * Verifies user's email address using OTP code
 *
 * Requires authenticated session. The access token is automatically included
 * in the request by the axios interceptor.
 *
 * @param otp - 6-digit OTP code sent to user's email
 * @returns Promise resolving to updated onboarding status
 * @throws Error if OTP is invalid, expired, or verification fails
 *
 * @example
 * ```typescript
 * import { verifyEmail } from './services/onboarding.service';
 *
 * try {
 *   const response = await verifyEmail('123456');
 *
 *   if (response.emailVerified) {
 *     console.log('Email verified successfully!');
 *     console.log('Next step:', response.currentStep);
 *   }
 * } catch (error) {
 *   console.error('Email verification failed:', error);
 * }
 * ```
 */
export async function verifyEmail(
  otp: string,
): Promise<OnboardingStatusResponse> {
  const response: AxiosResponse<OnboardingStatusResponse> = await axios.post(
    "cloud-api/onboarding/verify-email",
    { otp },
    {
      showSuccessToast: false, // Navigates to next onboarding step, no toast needed
    },
  );

  return response.data;
}

/**
 * Resends the email verification OTP to user's email
 *
 * Requires authenticated session. The access token is automatically included
 * in the request by the axios interceptor.
 *
 * @returns Promise that resolves when OTP is sent successfully
 * @throws Error if resend fails (too many attempts, invalid session, etc.)
 *
 * @example
 * ```typescript
 * import { resendEmailOtp } from './services/onboarding.service';
 *
 * try {
 *   await resendEmailOtp();
 *   console.log('OTP resent successfully. Check your email.');
 * } catch (error) {
 *   console.error('Failed to resend OTP:', error);
 * }
 * ```
 */
export async function resendEmailOtp(): Promise<void> {
  await axios.post("cloud-api/onboarding/resend-email-otp", undefined, {
    loadingMessage: "Sending code...",
    successMessage: "Code sent! Check your email.",
  });
}

/**
 * Retrieves current onboarding status for the authenticated user
 *
 * Requires authenticated session. The access token is automatically included
 * in the request by the axios interceptor.
 *
 * @returns Promise resolving to current onboarding status
 * @throws Error if status fetch fails (invalid token, session expired, etc.)
 *
 * @example
 * ```typescript
 * import { getStatus } from './services/onboarding.service';
 *
 * try {
 *   const status = await getStatus();
 *
 *   console.log('Current step:', status.currentStep);
 *   console.log('Email verified:', status.emailVerified);
 *   console.log('Onboarding complete:', status.onboardingComplete);
 *
 *   // Navigate user to appropriate step based on status
 *   if (!status.emailVerified) {
 *     navigate('/onboarding/verify-email');
 *   } else if (!status.phoneVerified) {
 *     navigate('/onboarding/verify-phone');
 *   }
 * } catch (error) {
 *   console.error('Failed to get onboarding status:', error);
 * }
 * ```
 */
export async function getStatus(): Promise<OnboardingStatusResponse> {
  const response: AxiosResponse<OnboardingStatusResponse> = await axios.get(
    "cloud-api/onboarding/status",
  );

  return response.data;
}

/**
 * Start onboarding response from the API
 * Contains the current step and OTP delivery information if applicable
 */
export interface StartOnboardingResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Human-readable message describing the action taken */
  message: string;
  /** Current onboarding step to navigate to */
  currentStep: string;
  /** Where OTP was sent, if applicable */
  otpSentTo?: "email" | "phone" | null;
  /** Masked destination (email or phone) for display purposes */
  otpDestination?: string;
}

/**
 * Starts the onboarding process for the authenticated user
 *
 * This endpoint triggers OTP sending if required for the current step.
 * For EMAIL_VERIFICATION step, it sends an email OTP.
 * For MOBILE_VERIFICATION step, it sends an SMS OTP.
 *
 * Requires authenticated session. The access token is automatically included
 * in the request by the axios interceptor.
 *
 * @returns Promise resolving to start onboarding response with step info
 * @throws Error if start fails (invalid token, session expired, etc.)
 *
 * @example
 * ```typescript
 * import { startOnboarding } from './services/onboarding.service';
 *
 * try {
 *   const response = await startOnboarding();
 *
 *   console.log('Current step:', response.currentStep);
 *   console.log('OTP sent to:', response.otpSentTo);
 *
 *   // Navigate to the appropriate step
 *   navigate(`/onboarding/${response.currentStep.toLowerCase()}`);
 * } catch (error) {
 *   console.error('Failed to start onboarding:', error);
 * }
 * ```
 */
export async function startOnboarding(): Promise<StartOnboardingResponse> {
  const response: AxiosResponse<StartOnboardingResponse> = await axios.post(
    "cloud-api/onboarding/start",
  );

  return response.data;
}

/**
 * Set password response from the API
 */
export interface SetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * Sets password for OAuth users during onboarding
 *
 * Called after OAuth signup to set a password for the account.
 * Moves user to MOBILE_VERIFICATION step on success.
 *
 * @param password - The password to set
 * @returns Promise resolving to success response
 * @throws Error if password validation fails or user is not on SET_PASSWORD step
 */
export async function setPassword(
  password: string,
): Promise<SetPasswordResponse> {
  const response: AxiosResponse<SetPasswordResponse> = await axios.post(
    "cloud-api/onboarding/set-password",
    { password },
  );

  return response.data;
}

// ============================================================================
// Two-Factor Authentication (2FA) API Functions
// ============================================================================

/**
 * TOTP setup response from the API
 * Contains QR code and manual setup key for authenticator apps
 */
export interface TotpSetupResponse {
  /** Base64 data URL of QR code image */
  qrCodeDataUrl: string;
  /** Manual setup key formatted with spaces for readability */
  manualSetupKey: string;
  /** Issuer name displayed in authenticator app */
  issuer: string;
  /** Account name (user's email) displayed in authenticator app */
  accountName: string;
}

/**
 * Backup codes response from the API
 * Returned after successful 2FA verification
 */
export interface BackupCodesResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Human-readable success message */
  message: string;
  /** Array of backup codes (plain text, shown only once) */
  backupCodes: string[];
  /** Warning message about saving backup codes */
  warning: string;
}

/**
 * Two-factor authentication status response
 */
export interface TwoFactorStatusResponse {
  /** Whether 2FA is enabled for the user */
  isEnabled: boolean;
  /** The 2FA method used (TOTP, PASSKEY, etc.) */
  method: string | null;
  /** Number of remaining backup codes */
  backupCodesRemaining: number;
  /** Last time 2FA was used for authentication */
  lastUsedAt: string | null;
  /** When 2FA was set up */
  createdAt: string | null;
}

/**
 * Initiates TOTP setup for the authenticated user
 *
 * Generates a new TOTP secret and returns QR code for scanning
 * with authenticator apps (Google Authenticator, Authy, etc.)
 *
 * Requires authenticated onboarding session.
 *
 * @returns Promise resolving to TOTP setup data with QR code
 * @throws Error if user already has 2FA enabled or session is invalid
 *
 * @example
 * ```typescript
 * import { initiateTotpSetup } from './services/onboarding.service';
 *
 * try {
 *   const setup = await initiateTotpSetup();
 *
 *   // Display QR code image
 *   qrCodeImg.src = setup.qrCodeDataUrl;
 *
 *   // Display manual key for users who can't scan
 *   manualKeyDisplay.textContent = setup.manualSetupKey;
 * } catch (error) {
 *   console.error('Failed to initiate TOTP setup:', error);
 * }
 * ```
 */
export async function initiateTotpSetup(): Promise<TotpSetupResponse> {
  const response: AxiosResponse<TotpSetupResponse> = await axios.post(
    "cloud-api/onboarding/2fa/totp/setup",
  );

  return response.data;
}

/**
 * Verifies TOTP setup with a 6-digit code from authenticator app
 *
 * On success, stores the TOTP secret and returns backup codes.
 * The backup codes are shown only once and should be saved securely.
 *
 * Requires authenticated onboarding session with pending TOTP setup.
 *
 * @param token - 6-digit TOTP code from authenticator app
 * @returns Promise resolving to backup codes response
 * @throws Error if code is invalid, expired, or no pending setup exists
 *
 * @example
 * ```typescript
 * import { verifyTotpSetup } from './services/onboarding.service';
 *
 * try {
 *   const response = await verifyTotpSetup('123456');
 *
 *   if (response.success) {
 *     console.log('2FA enabled successfully!');
 *
 *     // Display backup codes to user (they must save these)
 *     response.backupCodes.forEach(code => {
 *       console.log('Backup code:', code);
 *     });
 *
 *     console.log('Warning:', response.warning);
 *   }
 * } catch (error) {
 *   console.error('TOTP verification failed:', error);
 * }
 * ```
 */
export async function verifyTotpSetup(
  token: string,
): Promise<BackupCodesResponse> {
  const response: AxiosResponse<BackupCodesResponse> = await axios.post(
    "cloud-api/onboarding/2fa/totp/verify",
    { token },
  );

  return response.data;
}

/**
 * Skips 2FA setup and completes onboarding without MFA
 *
 * Users can enable 2FA later from their account settings.
 * Completes the onboarding process and activates the account.
 *
 * Requires authenticated onboarding session.
 *
 * @returns Promise resolving to success response
 * @throws Error if session is invalid or onboarding already complete
 *
 * @example
 * ```typescript
 * import { skip2FASetup } from './services/onboarding.service';
 *
 * try {
 *   const response = await skip2FASetup();
 *
 *   if (response.success) {
 *     console.log('2FA skipped, onboarding complete');
 *     // Redirect to dashboard
 *   }
 * } catch (error) {
 *   console.error('Failed to skip 2FA:', error);
 * }
 * ```
 */
export async function skip2FASetup(): Promise<{
  success: boolean;
  message: string;
}> {
  const response: AxiosResponse<{ success: boolean; message: string }> =
    await axios.post("cloud-api/onboarding/2fa/skip");

  return response.data;
}

/**
 * Gets current 2FA status for the authenticated user
 *
 * Returns information about whether 2FA is enabled, the method used,
 * and remaining backup codes.
 *
 * Requires authenticated onboarding session.
 *
 * @returns Promise resolving to 2FA status
 * @throws Error if session is invalid
 *
 * @example
 * ```typescript
 * import { get2FAStatus } from './services/onboarding.service';
 *
 * try {
 *   const status = await get2FAStatus();
 *
 *   if (status.isEnabled) {
 *     console.log('2FA is enabled via:', status.method);
 *     console.log('Backup codes remaining:', status.backupCodesRemaining);
 *   } else {
 *     console.log('2FA is not enabled');
 *   }
 * } catch (error) {
 *   console.error('Failed to get 2FA status:', error);
 * }
 * ```
 */
export async function get2FAStatus(): Promise<TwoFactorStatusResponse> {
  const response: AxiosResponse<TwoFactorStatusResponse> = await axios.get(
    "cloud-api/onboarding/2fa/status",
  );

  return response.data;
}

// ============================================================================
// Passkey (WebAuthn) 2FA API Functions
// ============================================================================

/**
 * Passkey registration options response from the API
 * Contains the WebAuthn credential creation options
 */
export interface PasskeyRegistrationOptionsResponse {
  /** WebAuthn credential creation options to pass to the browser */
  options: PublicKeyCredentialCreationOptions;
}

/**
 * WebAuthn credential creation options (simplified type for frontend)
 */
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

/**
 * WebAuthn registration response from browser (simplified type)
 */
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

/**
 * Initiates Passkey setup for the authenticated user
 *
 * Generates WebAuthn registration options for creating a new passkey.
 * The returned options should be passed to the browser's WebAuthn API
 * via @simplewebauthn/browser's startRegistration function.
 *
 * Requires authenticated onboarding session.
 *
 * @returns Promise resolving to passkey registration options
 * @throws Error if user already has 2FA enabled or session is invalid
 *
 * @example
 * ```typescript
 * import { initiatePasskeySetup } from './services/onboarding.service';
 * import { startRegistration } from '@simplewebauthn/browser';
 *
 * try {
 *   const { options } = await initiatePasskeySetup();
 *   const credential = await startRegistration(options);
 *   // Then verify with verifyPasskeySetup(credential)
 * } catch (error) {
 *   console.error('Failed to initiate passkey setup:', error);
 * }
 * ```
 */
export async function initiatePasskeySetup(): Promise<PasskeyRegistrationOptionsResponse> {
  const response: AxiosResponse<PasskeyRegistrationOptionsResponse> =
    await axios.post("cloud-api/onboarding/2fa/passkey/setup");

  return response.data;
}

/**
 * Verifies Passkey setup with the credential from the browser
 *
 * On success, stores the passkey and returns backup codes.
 * The backup codes are shown only once and should be saved securely.
 *
 * Requires authenticated onboarding session with pending passkey setup.
 *
 * @param credential - Registration response from browser's WebAuthn API
 * @returns Promise resolving to backup codes response
 * @throws Error if verification fails or no pending setup exists
 *
 * @example
 * ```typescript
 * import { verifyPasskeySetup } from './services/onboarding.service';
 *
 * try {
 *   const response = await verifyPasskeySetup(credential);
 *
 *   if (response.success) {
 *     console.log('Passkey registered successfully!');
 *     // Display backup codes to user
 *   }
 * } catch (error) {
 *   console.error('Passkey verification failed:', error);
 * }
 * ```
 */
export async function verifyPasskeySetup(
  credential: RegistrationResponseJSON,
): Promise<BackupCodesResponse> {
  const response: AxiosResponse<BackupCodesResponse> = await axios.post(
    "cloud-api/onboarding/2fa/passkey/verify",
    { credential },
  );

  return response.data;
}

/**
 * Sets password for OAuth users during onboarding
 *
 * OAuth users (Google, etc.) don't have a password set during initial signup.
 * This endpoint allows them to set a password for their account.
 *
 * Requires authenticated session. The access token is automatically included
 * in the request by the axios interceptor.
 *
 * @param password - Password meeting security requirements
 * @returns Promise that resolves when password is set successfully
 * @throws Error if password doesn't meet requirements or user already has password
 *
 * @example
 * ```typescript
 * import { setPassword } from './services/onboarding.service';
 *
 * try {
 *   await setPassword('SecurePass123!');
 *   console.log('Password set successfully');
 * } catch (error) {
 *   console.error('Failed to set password:', error);
 * }
 * ```
 */
export async function setPassword(password: string): Promise<void> {
  await axios.post("cloud-api/onboarding/set-password", { password });
}

// ============================================================================
// Mobile Verification
// ============================================================================

/**
 * Verification method for mobile verification
 */
export type VerificationMethod =
  | "WHATSAPP_QR"
  | "SMS_QR"
  | "MANUAL_OTP";

/**
 * Data transfer object for initiating mobile verification
 *
 * For QR-based methods (WHATSAPP_QR, SMS_QR): phone is optional - comes from webhook
 * For OTP-based method (MANUAL_OTP): phone is required
 */
export interface InitiateMobileVerificationDto {
  /** Phone number in E.164 format (e.g., +919876543210) - optional for QR methods */
  phone?: string;
  /** ISO country code (e.g., IN, US) - optional for QR methods */
  phoneCountry?: string;
  /** Verification method to use */
  method?: VerificationMethod;
}

/**
 * Mobile verification status response from the API
 */
export interface MobileVerificationStatusResponse {
  /** Unique verification ID */
  verificationId: string;
  /** Verification method used */
  method: VerificationMethod;
  /** Verification token for QR code methods (e.g., "VER123ABC") */
  verificationToken?: string;
  /** Whether verification is complete */
  isVerified: boolean;
  /** Phone number being verified - may be null for QR methods until webhook receives it */
  phone?: string | null;
  /** Phone country code - may be null for QR methods */
  phoneCountry?: string | null;
  /** When the verification expires */
  expiresAt: string;
  /** Human-readable status message */
  message: string;
  /** Instructions for completing verification */
  instructions?: string;
  /** WhatsApp business number for QR code generation (from server) */
  whatsappNumber?: string;
}

/**
 * Initiates mobile verification for the authenticated user
 *
 * @param data - Phone number and verification method
 * @returns Promise resolving to verification status with token
 * @throws Error if initiation fails
 *
 * @example
 * ```typescript
 * const response = await initiateMobileVerification({
 *   phone: '+919876543210',
 *   phoneCountry: 'IN',
 *   method: 'WHATSAPP_QR'
 * });
 * console.log('Verification token:', response.verificationToken);
 * ```
 */
export async function initiateMobileVerification(
  data: InitiateMobileVerificationDto,
): Promise<MobileVerificationStatusResponse> {
  const response: AxiosResponse<MobileVerificationStatusResponse> =
    await axios.post("cloud-api/onboarding/mobile-verification/initiate", data);

  return response.data;
}

/**
 * Gets the current mobile verification status for the authenticated user
 *
 * Use this for polling to detect when webhook-based verification completes.
 *
 * @returns Promise resolving to current verification status
 * @throws Error if no pending verification exists
 *
 * @example
 * ```typescript
 * const status = await getMobileVerificationStatus();
 * if (status.isVerified) {
 *   console.log('Phone verified!');
 * }
 * ```
 */
export async function getMobileVerificationStatus(): Promise<MobileVerificationStatusResponse> {
  const response: AxiosResponse<MobileVerificationStatusResponse> =
    await axios.get("cloud-api/onboarding/mobile-verification/status");

  return response.data;
}

/**
 * Resends mobile verification (generates new token)
 *
 * @param data - Phone number and verification method
 * @returns Promise resolving to new verification status
 * @throws Error if resend fails
 */
export async function resendMobileVerification(
  data: InitiateMobileVerificationDto,
): Promise<MobileVerificationStatusResponse> {
  const response: AxiosResponse<MobileVerificationStatusResponse> =
    await axios.post("cloud-api/onboarding/mobile-verification/resend", data);

  return response.data;
}

/**
 * Verifies mobile number using OTP entered by user
 *
 * Use this for MANUAL_OTP or MANUAL_OTP verification methods where
 * the user receives an OTP and enters it manually.
 *
 * @param otp - 6-digit OTP code
 * @returns Promise resolving to verification result
 * @throws Error if OTP is invalid or expired
 *
 * @example
 * ```typescript
 * try {
 *   const result = await verifyMobileOtp('123456');
 *   if (result.success) {
 *     console.log('Phone verified successfully!');
 *   }
 * } catch (error) {
 *   console.error('Invalid OTP');
 * }
 * ```
 */
export async function verifyMobileOtp(
  otp: string,
): Promise<{ success: boolean; message: string }> {
  const response: AxiosResponse<{ success: boolean; message: string }> =
    await axios.post("cloud-api/onboarding/mobile-verification/verify-otp", {
      otp,
    });

  return response.data;
}
