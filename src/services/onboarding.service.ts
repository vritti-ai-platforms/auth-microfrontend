import { axios } from '@vritti/quantum-ui/axios';
import type { AxiosResponse } from 'axios';

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
  data: RegisterDto
): Promise<OnboardingStatusResponse> {
  const response: AxiosResponse<OnboardingStatusResponse> = await axios.post(
    '/onboarding/register',
    data,
    { public: true } // Bypass token recovery for public auth endpoint
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
  otp: string
): Promise<OnboardingStatusResponse> {
  const response: AxiosResponse<OnboardingStatusResponse> = await axios.post(
    '/onboarding/verify-email',
    { otp }
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
  await axios.post('/onboarding/resend-email-otp');
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
    '/onboarding/status'
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
  otpSentTo?: 'email' | 'phone' | null;
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
    '/onboarding/start'
  );

  return response.data;
}
