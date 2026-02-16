import { axios } from "@vritti/quantum-ui/axios";

export enum OnboardingStep {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PHONE_VERIFICATION = "PHONE_VERIFICATION",
  SET_PASSWORD = "SET_PASSWORD",
  MFA_SETUP = "MFA_SETUP",
  COMPLETED = "COMPLETED",
}

export enum AccountStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

export type SignupMethod = "email" | "oauth";

export type MFAMethod = "totp" | "sms" | "passkey";

export interface MFAChallenge {
  sessionId: string;
  availableMethods: MFAMethod[];
  defaultMethod: MFAMethod;
  maskedPhone?: string;
}

export interface SignupDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  fullName?: string;
  displayName?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface SignupResponse {
  accessToken: string;
  expiresIn: number;
  isNewUser: boolean;
  signupMethod: SignupMethod;
  currentStep: OnboardingStep;
}

export interface LoginResponse {
  accessToken?: string;
  expiresIn?: number;
  requiresOnboarding?: boolean;
  onboardingStep?: OnboardingStep;
  requiresMfa?: boolean;
  mfaChallenge?: MFAChallenge;
}

// Registers a new user account
export function signup(data: SignupDto): Promise<SignupResponse> {
  return axios
    .post<SignupResponse>("cloud-api/auth/signup", data, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Authenticates a user with email and password
export function login(data: LoginDto): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>("cloud-api/auth/login", data, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// ============================================================================
// MFA Verification API Functions
// ============================================================================

// Verifies TOTP code for MFA authentication
export function verifyTotp(sessionId: string, code: string): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>("cloud-api/auth/mfa/verify-totp", { sessionId, code }, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Sends SMS verification code for MFA authentication
export function sendSmsCode(sessionId: string): Promise<void> {
  return axios
    .post("cloud-api/auth/mfa/sms/send", { sessionId }, {
      public: true,
      loadingMessage: "Sending code...",
      successMessage: "Code sent! Check your phone.",
    })
    .then(() => undefined);
}

// Verifies SMS code for MFA authentication
export function verifySms(sessionId: string, code: string): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>("cloud-api/auth/mfa/sms/verify", { sessionId, code }, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Starts passkey verification for MFA authentication
export function startPasskeyVerification(sessionId: string): Promise<PasskeyAuthOptionsResponse> {
  return axios
    .post<PasskeyAuthOptionsResponse>("cloud-api/auth/mfa/passkey/start", { sessionId }, { public: true })
    .then((r) => r.data);
}

// Verifies passkey for MFA authentication
export function verifyPasskeyMfa(sessionId: string, credential: AuthenticationResponseJSON): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>("cloud-api/auth/mfa/passkey/verify", { sessionId, credential }, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// ============================================================================
// Passkey (WebAuthn) Authentication API Functions
// ============================================================================

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

export interface PasskeyAuthOptionsResponse {
  options: PublicKeyCredentialRequestOptions;
  sessionId: string;
}

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

// Starts passkey authentication flow
export function startPasskeyLogin(email?: string): Promise<PasskeyAuthOptionsResponse> {
  return axios
    .post<PasskeyAuthOptionsResponse>("cloud-api/auth/passkey/start", { email }, { public: true })
    .then((r) => r.data);
}

// Verifies passkey authentication and logs in the user
export function verifyPasskeyLogin(sessionId: string, credential: AuthenticationResponseJSON): Promise<LoginResponse> {
  return axios
    .post<LoginResponse>("cloud-api/auth/passkey/verify", { sessionId, credential }, { public: true })
    .then((r) => r.data);
}

// ============================================================================
// Password Reset API Functions
// ============================================================================

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyResetOtpResponse {
  resetToken: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Requests a password reset OTP to be sent to the provided email
export function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return axios
    .post<ForgotPasswordResponse>("cloud-api/auth/forgot-password", { email }, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Verifies the password reset OTP and returns a reset token
export function verifyResetOtp(email: string, otp: string): Promise<VerifyResetOtpResponse> {
  return axios
    .post<VerifyResetOtpResponse>("cloud-api/auth/verify-reset-otp", { email, otp }, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}

// Resets the password using the reset token from OTP verification
export function resetPassword(resetToken: string, newPassword: string): Promise<ResetPasswordResponse> {
  return axios
    .post<ResetPasswordResponse>("cloud-api/auth/reset-password", { resetToken, newPassword }, {
      public: true,
      showSuccessToast: false,
    })
    .then((r) => r.data);
}
