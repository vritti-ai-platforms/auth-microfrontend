import { axios } from "@vritti/quantum-ui/axios";
import type { AxiosResponse } from "axios";

/**
 * Onboarding step enumeration
 */
export enum OnboardingStep {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
  SET_PASSWORD = "SET_PASSWORD",
  MFA_SETUP = "MFA_SETUP",
  COMPLETED = "COMPLETED",
}

/**
 * Account status enumeration
 */
export enum AccountStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

/**
 * Signup method type - indicates how the user signed up
 */
export type SignupMethod = "email" | "oauth";

/**
 * MFA method types
 */
export type MFAMethod = "totp" | "sms" | "passkey";

/**
 * MFA challenge data returned when login requires MFA
 */
export interface MFAChallenge {
  /** Session ID for MFA verification */
  sessionId: string;
  /** Available MFA methods for the user */
  availableMethods: MFAMethod[];
  /** Default/recommended MFA method */
  defaultMethod: MFAMethod;
  /** Masked phone number for SMS (e.g., "+1 *** *** 4567") */
  maskedPhone?: string;
}

/**
 * User signup data transfer object
 */
export interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * User login data transfer object
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * User response data transfer object
 */
export interface UserResponseDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
}

/**
 * Signup response from API (OnboardingStatusResponseDto + tokens)
 * Uses unified auth: accessToken in response, refreshToken in httpOnly cookie
 */
export interface SignupResponse {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  currentStep: OnboardingStep;
  onboardingComplete: boolean;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  /** Access token for API requests (store in memory) */
  accessToken: string;
  /** Token lifetime in seconds */
  expiresIn: number;
  /** Whether this is a newly created user or resuming onboarding */
  isNewUser: boolean;
  /** The method used to signup (email or oauth) */
  signupMethod: SignupMethod;
}

/**
 * Login response from API (AuthResponseDto)
 * Uses unified auth: accessToken in response, refreshToken in httpOnly cookie
 */
export interface LoginResponse {
  /** Access token for API requests (store in memory) */
  accessToken?: string;
  /** Token type (always 'Bearer') */
  tokenType?: string;
  /** Token lifetime in seconds */
  expiresIn?: number;
  /** Authenticated user info */
  user: UserResponseDto;
  /** Whether user needs to complete onboarding */
  requiresOnboarding?: boolean;
  /** Current onboarding step if requiresOnboarding is true */
  onboardingStep?: OnboardingStep;
  /** Whether MFA verification is required */
  requiresMfa?: boolean;
  /** MFA challenge data if requiresMfa is true */
  mfaChallenge?: MFAChallenge;
}

/**
 * Registers a new user account
 *
 * @param data - User signup information
 * @returns Promise resolving to signup response with access token
 * @throws Error if signup fails (email exists, validation errors, etc.)
 *
 * @example
 * ```typescript
 * import { signup } from './services/auth.service';
 * import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
 *
 * try {
 *   const response = await signup({
 *     email: 'user@example.com',
 *     password: 'SecurePass123!',
 *     firstName: 'John',
 *     lastName: 'Doe'
 *   });
 *
 *   // Store access token (refresh token is in httpOnly cookie)
 *   setToken(response.accessToken);
 *   scheduleTokenRefresh(response.expiresIn);
 *
 *   console.log('Signup successful:', response.currentStep);
 * } catch (error) {
 *   console.error('Signup failed:', error);
 * }
 * ```
 */
export async function signup(data: SignupDto): Promise<SignupResponse> {
  const response: AxiosResponse<SignupResponse> = await axios.post(
    "cloud-api/auth/signup",
    data,
    {
      public: true, // Bypass token recovery for public auth endpoint
      showSuccessToast: false, // Navigates to onboarding, no toast needed
    },
  );

  return response.data;
}

/**
 * Authenticates a user with email and password
 *
 * @param data - User login credentials
 * @returns Promise resolving to login response with access token
 * @throws Error if login fails (invalid credentials, account locked, etc.)
 *
 * @example
 * ```typescript
 * import { login } from './services/auth.service';
 * import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
 *
 * try {
 *   const response = await login({
 *     email: 'user@example.com',
 *     password: 'SecurePass123!'
 *   });
 *
 *   // Store access token (refresh token is in httpOnly cookie)
 *   if (response.accessToken) {
 *     setToken(response.accessToken);
 *     if (response.expiresIn) {
 *       scheduleTokenRefresh(response.expiresIn);
 *     }
 *   }
 *
 *   if (response.requiresOnboarding) {
 *     // Navigate to onboarding step
 *   } else {
 *     // Navigate to dashboard
 *   }
 * } catch (error) {
 *   console.error('Login failed:', error);
 * }
 * ```
 */
export async function login(data: LoginDto): Promise<LoginResponse> {
  const response: AxiosResponse<LoginResponse> = await axios.post(
    "cloud-api/auth/login",
    data,
    {
      public: true, // Bypass token recovery for public auth endpoint
      showSuccessToast: false, // Navigates to dashboard/onboarding, no toast needed
    },
  );

  return response.data;
}

// ============================================================================
// MFA Verification API Functions
// ============================================================================

/**
 * Verifies TOTP code for MFA authentication
 *
 * @param sessionId - MFA session ID from login response
 * @param code - 6-digit TOTP code from authenticator app
 * @returns Promise resolving to login response with access token
 * @throws Error if code is invalid or session expired
 *
 * @example
 * ```typescript
 * import { verifyTotp } from './services/auth.service';
 * import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
 *
 * try {
 *   const response = await verifyTotp(sessionId, '123456');
 *
 *   if (response.accessToken) {
 *     setToken(response.accessToken);
 *     scheduleTokenRefresh(response.expiresIn);
 *   }
 *   // Navigate to dashboard
 * } catch (error) {
 *   console.error('TOTP verification failed:', error);
 * }
 * ```
 */
export async function verifyTotp(
  sessionId: string,
  code: string,
): Promise<LoginResponse> {
  const response: AxiosResponse<LoginResponse> = await axios.post(
    "cloud-api/auth/mfa/verify-totp",
    { sessionId, code },
    {
      public: true,
      showSuccessToast: false,
    },
  );

  return response.data;
}

/**
 * Sends SMS verification code for MFA authentication
 *
 * @param sessionId - MFA session ID from login response
 * @returns Promise that resolves when SMS is sent
 * @throws Error if session is invalid or SMS rate limited
 *
 * @example
 * ```typescript
 * import { sendSmsCode } from './services/auth.service';
 *
 * try {
 *   await sendSmsCode(sessionId);
 *   console.log('SMS code sent successfully');
 * } catch (error) {
 *   console.error('Failed to send SMS:', error);
 * }
 * ```
 */
export async function sendSmsCode(sessionId: string): Promise<void> {
  await axios.post(
    "cloud-api/auth/mfa/sms/send",
    { sessionId },
    {
      public: true,
      loadingMessage: "Sending code...",
      successMessage: "Code sent! Check your phone.",
    },
  );
}

/**
 * Verifies SMS code for MFA authentication
 *
 * @param sessionId - MFA session ID from login response
 * @param code - 6-digit SMS code
 * @returns Promise resolving to login response with access token
 * @throws Error if code is invalid or session expired
 *
 * @example
 * ```typescript
 * import { verifySms } from './services/auth.service';
 * import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
 *
 * try {
 *   const response = await verifySms(sessionId, '123456');
 *
 *   if (response.accessToken) {
 *     setToken(response.accessToken);
 *     scheduleTokenRefresh(response.expiresIn);
 *   }
 *   // Navigate to dashboard
 * } catch (error) {
 *   console.error('SMS verification failed:', error);
 * }
 * ```
 */
export async function verifySms(
  sessionId: string,
  code: string,
): Promise<LoginResponse> {
  const response: AxiosResponse<LoginResponse> = await axios.post(
    "cloud-api/auth/mfa/sms/verify",
    { sessionId, code },
    {
      public: true,
      showSuccessToast: false,
    },
  );

  return response.data;
}

/**
 * Starts passkey verification for MFA authentication
 *
 * @param sessionId - MFA session ID from login response
 * @returns Promise resolving to passkey auth options
 * @throws Error if session is invalid or passkey not configured
 *
 * @example
 * ```typescript
 * import { startPasskeyVerification } from './services/auth.service';
 * import { startAuthentication } from '@simplewebauthn/browser';
 *
 * try {
 *   const { options, sessionId } = await startPasskeyVerification(mfaSessionId);
 *   const credential = await startAuthentication(options);
 *   // Then verify with verifyPasskeyMfa(sessionId, credential)
 * } catch (error) {
 *   console.error('Failed to start passkey verification:', error);
 * }
 * ```
 */
export async function startPasskeyVerification(
  sessionId: string,
): Promise<PasskeyAuthOptionsResponse> {
  const response: AxiosResponse<PasskeyAuthOptionsResponse> = await axios.post(
    "cloud-api/auth/mfa/passkey/start",
    { sessionId },
    { public: true },
  );

  return response.data;
}

/**
 * Verifies passkey for MFA authentication
 *
 * @param sessionId - Session ID from startPasskeyVerification response
 * @param credential - Authentication response from browser's WebAuthn API
 * @returns Promise resolving to login response with access token
 * @throws Error if verification fails
 *
 * @example
 * ```typescript
 * import { verifyPasskeyMfa } from './services/auth.service';
 * import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
 *
 * try {
 *   const response = await verifyPasskeyMfa(sessionId, credential);
 *
 *   if (response.accessToken) {
 *     setToken(response.accessToken);
 *     scheduleTokenRefresh(response.expiresIn);
 *   }
 *   // Navigate to dashboard
 * } catch (error) {
 *   console.error('Passkey verification failed:', error);
 * }
 * ```
 */
export async function verifyPasskeyMfa(
  sessionId: string,
  credential: AuthenticationResponseJSON,
): Promise<LoginResponse> {
  const response: AxiosResponse<LoginResponse> = await axios.post(
    "cloud-api/auth/mfa/passkey/verify",
    { sessionId, credential },
    {
      public: true,
      showSuccessToast: false,
    },
  );

  return response.data;
}

// ============================================================================
// Passkey (WebAuthn) Authentication API Functions
// ============================================================================

/**
 * WebAuthn authentication options (simplified type for frontend)
 */
export interface PublicKeyCredentialRequestOptions {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{
    id: string;
    type: "public-key";
    transports?: string[];
  }>;
  userVerification?: "discouraged" | "preferred" | "required";
}

/**
 * Passkey authentication options response from the API
 */
export interface PasskeyAuthOptionsResponse {
  /** WebAuthn credential request options to pass to the browser */
  options: PublicKeyCredentialRequestOptions;
  /** Session ID to include when verifying the authentication */
  sessionId: string;
}

/**
 * WebAuthn authentication response from browser (simplified type)
 */
export interface AuthenticationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  authenticatorAttachment?: "platform" | "cross-platform";
  clientExtensionResults: Record<string, unknown>;
  type: "public-key";
}

/**
 * Starts passkey authentication flow
 *
 * Generates WebAuthn authentication options for logging in with a passkey.
 * The returned options should be passed to the browser's WebAuthn API
 * via @simplewebauthn/browser's startAuthentication function.
 *
 * @param email - Optional email to filter allowed credentials
 * @returns Promise resolving to passkey auth options with session ID
 *
 * @example
 * ```typescript
 * import { startPasskeyLogin } from './services/auth.service';
 * import { startAuthentication } from '@simplewebauthn/browser';
 *
 * try {
 *   const { options, sessionId } = await startPasskeyLogin();
 *   const credential = await startAuthentication(options);
 *   // Then verify with verifyPasskeyLogin(sessionId, credential)
 * } catch (error) {
 *   console.error('Failed to start passkey login:', error);
 * }
 * ```
 */
export async function startPasskeyLogin(
  email?: string,
): Promise<PasskeyAuthOptionsResponse> {
  const response: AxiosResponse<PasskeyAuthOptionsResponse> = await axios.post(
    "cloud-api/auth/passkey/start",
    { email },
    { public: true },
  );

  return response.data;
}

/**
 * Verifies passkey authentication and logs in the user
 *
 * On success, returns access token and user info.
 * The refresh token is set as an httpOnly cookie automatically.
 *
 * @param sessionId - Session ID from startPasskeyLogin response
 * @param credential - Authentication response from browser's WebAuthn API
 * @returns Promise resolving to login response with access token
 * @throws Error if verification fails or passkey not found
 *
 * @example
 * ```typescript
 * import { verifyPasskeyLogin } from './services/auth.service';
 * import { setToken, scheduleTokenRefresh } from '@vritti/quantum-ui/axios';
 *
 * try {
 *   const response = await verifyPasskeyLogin(sessionId, credential);
 *
 *   if (response.accessToken) {
 *     setToken(response.accessToken);
 *     scheduleTokenRefresh(response.expiresIn);
 *   }
 *
 *   // Navigate to dashboard
 * } catch (error) {
 *   console.error('Passkey login failed:', error);
 * }
 * ```
 */
export async function verifyPasskeyLogin(
  sessionId: string,
  credential: AuthenticationResponseJSON,
): Promise<LoginResponse> {
  const response: AxiosResponse<LoginResponse> = await axios.post(
    "cloud-api/auth/passkey/verify",
    { sessionId, credential },
    { public: true },
  );

  return response.data;
}
