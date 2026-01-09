import { axios } from '@vritti/quantum-ui/axios';
import type { AxiosResponse } from 'axios';

/**
 * Onboarding step enumeration
 */
export enum OnboardingStep {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION',
  SET_PASSWORD = 'SET_PASSWORD',
  MFA_SETUP = 'MFA_SETUP',
  COMPLETED = 'COMPLETED',
}

/**
 * Account status enumeration
 */
export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

/**
 * Signup method type - indicates how the user signed up
 */
export type SignupMethod = 'email' | 'oauth';

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
    '/auth/signup',
    data,
    { public: true }, // Bypass token recovery for public auth endpoint
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
    '/auth/login',
    data,
    { public: true }, // Bypass token recovery for public auth endpoint
  );

  return response.data;
}
