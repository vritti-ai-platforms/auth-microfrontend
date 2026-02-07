import { z } from 'zod';

/**
 * Validation schema for OTP verification
 * Reused from auth.ts for consistency
 */
export const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers'),
});

export type OTPFormData = z.infer<typeof otpSchema>;

/**
 * Validation schema for new email entry
 */
export const newEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export type NewEmailFormData = z.infer<typeof newEmailSchema>;

/**
 * Validation schema for new phone entry
 */
export const newPhoneSchema = z.object({
  newPhone: z.string().min(10, 'Please enter a valid phone number'),
  phoneCountry: z.string(),
});

export type NewPhoneFormData = z.infer<typeof newPhoneSchema>;
