import { axios } from '@vritti/quantum-ui/axios';
import type { AxiosResponse } from 'axios';

// Step 1: Request Identity Verification
export interface IdentityVerificationResponse {
  verificationId: string;
  expiresAt: string;
  maskedEmail?: string;
  maskedPhone?: string;
}

// Step 2: Verify Identity
export interface VerifyIdentityRequest {
  verificationId: string;
  otpCode: string;
}

export interface VerifyIdentityResponse {
  changeRequestId: string;
  changeRequestsToday: number;
}

// Step 3: Request Change
export interface RequestChangeRequest {
  changeRequestId: string;
  newEmail?: string;
  newPhone?: string;
  phoneCountry?: string;
}

export interface RequestChangeResponse {
  verificationId: string;
  expiresAt: string;
}

// Step 4: Verify Change
export interface VerifyChangeRequest {
  changeRequestId: string;
  verificationId: string;
  otpCode: string;
}

export interface VerifyChangeResponse {
  success: boolean;
  revertToken: string;
  revertExpiresAt: string;
  newEmail?: string;
  newPhone?: string;
}

// Resend OTP
export interface ResendOtpRequest {
  verificationId: string;
}

export interface ResendOtpResponse {
  success: boolean;
  expiresAt: string;
}

// Revert Change
export interface RevertChangeRequest {
  revertToken: string;
}

export interface RevertChangeResponse {
  success: boolean;
  revertedEmail?: string;
  revertedPhone?: string;
}

export const verificationService = {
  // Email Flow
  requestEmailIdentityVerification: async (): Promise<IdentityVerificationResponse> => {
    const response: AxiosResponse<IdentityVerificationResponse> = await axios.post(
      '/cloud-api/users/contact/email/request-identity-verification',
    );
    return response.data;
  },

  verifyEmailIdentity: async (data: VerifyIdentityRequest): Promise<VerifyIdentityResponse> => {
    const response: AxiosResponse<VerifyIdentityResponse> = await axios.post(
      '/cloud-api/users/contact/email/verify-identity',
      data,
    );
    return response.data;
  },

  requestEmailChange: async (data: RequestChangeRequest): Promise<RequestChangeResponse> => {
    const response: AxiosResponse<RequestChangeResponse> = await axios.post(
      '/cloud-api/users/contact/email/submit-new-email',
      data,
    );
    return response.data;
  },

  verifyEmailChange: async (data: VerifyChangeRequest): Promise<VerifyChangeResponse> => {
    const response: AxiosResponse<VerifyChangeResponse> = await axios.post(
      '/cloud-api/users/contact/email/verify-new-email',
      data,
    );
    return response.data;
  },

  resendEmailOtp: async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const response: AxiosResponse<ResendOtpResponse> = await axios.post(
      '/cloud-api/users/contact/email/resend-otp',
      data,
    );
    return response.data;
  },

  revertEmailChange: async (data: RevertChangeRequest): Promise<RevertChangeResponse> => {
    const response: AxiosResponse<RevertChangeResponse> = await axios.post(
      '/cloud-api/users/contact/email/revert',
      data,
    );
    return response.data;
  },

  // Phone Flow
  requestPhoneIdentityVerification: async (): Promise<IdentityVerificationResponse> => {
    const response: AxiosResponse<IdentityVerificationResponse> = await axios.post(
      '/cloud-api/users/contact/phone/request-identity-verification',
    );
    return response.data;
  },

  verifyPhoneIdentity: async (data: VerifyIdentityRequest): Promise<VerifyIdentityResponse> => {
    const response: AxiosResponse<VerifyIdentityResponse> = await axios.post(
      '/cloud-api/users/contact/phone/verify-identity',
      data,
    );
    return response.data;
  },

  requestPhoneChange: async (data: RequestChangeRequest): Promise<RequestChangeResponse> => {
    const response: AxiosResponse<RequestChangeResponse> = await axios.post(
      '/cloud-api/users/contact/phone/submit-new-phone',
      data,
    );
    return response.data;
  },

  verifyPhoneChange: async (data: VerifyChangeRequest): Promise<VerifyChangeResponse> => {
    const response: AxiosResponse<VerifyChangeResponse> = await axios.post(
      '/cloud-api/users/contact/phone/verify-new-phone',
      data,
    );
    return response.data;
  },

  resendPhoneOtp: async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    const response: AxiosResponse<ResendOtpResponse> = await axios.post(
      '/cloud-api/users/contact/phone/resend-otp',
      data,
    );
    return response.data;
  },

  revertPhoneChange: async (data: RevertChangeRequest): Promise<RevertChangeResponse> => {
    const response: AxiosResponse<RevertChangeResponse> = await axios.post(
      '/cloud-api/users/contact/phone/revert',
      data,
    );
    return response.data;
  },
};
