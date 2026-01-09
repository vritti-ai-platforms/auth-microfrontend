/**
 * Authentication & Onboarding Services
 *
 * Centralized exports for all auth and onboarding-related API services
 */

export type {
  AccountStatus,
  LoginDto,
  LoginResponse,
  OnboardingStep,
  SignupDto,
  SignupMethod,
  SignupResponse,
  UserResponseDto,
} from './auth.service';
// Auth Service
export {
  login,
  signup,
} from './auth.service';
export type {
  OnboardingStatusResponse,
  RegisterDto,
  StartOnboardingResponse,
  VerifyEmailDto,
} from './onboarding.service';
// Onboarding Service
export {
  getStatus,
  register,
  resendEmailOtp,
  startOnboarding,
  verifyEmail,
} from './onboarding.service';
