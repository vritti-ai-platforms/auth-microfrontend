/**
 * Authentication & Onboarding Services
 *
 * Centralized exports for all auth and onboarding-related API services
 */

// Auth Service
export {
  signup,
  login,
} from './auth.service';

export type {
  SignupDto,
  LoginDto,
  SignupResponse,
  LoginResponse,
  UserResponseDto,
  OnboardingStep,
  AccountStatus,
} from './auth.service';

// Onboarding Service
export {
  register,
  verifyEmail,
  resendEmailOtp,
  getStatus,
} from './onboarding.service';

export type {
  RegisterDto,
  OnboardingStatusResponse,
  VerifyEmailDto,
} from './onboarding.service';
