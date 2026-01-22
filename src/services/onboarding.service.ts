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
