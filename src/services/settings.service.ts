import { axios } from '@vritti/quantum-ui/axios';
import type { AxiosResponse } from 'axios';
import type {
  ChangePasswordDto,
  ProfileData,
  Session,
  UpdateProfileDto,
} from '../schemas/settings';
import { AccountStatus } from '../schemas/settings';

/**
 * Backend response structure from /cloud-api/auth/me endpoint
 */
interface AuthStatusResponse {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    phoneCountry?: string | null;
    accountStatus: string;
    locale: string;
    timezone: string;
    createdAt: string;
    lastLoginAt?: string | null;
    profilePictureUrl?: string | null;
    // Additional fields from backend that frontend doesn't use yet
    emailVerified?: boolean;
    phoneVerified?: boolean;
    onboardingStep?: string;
    hasPassword?: boolean;
  };
  accessToken?: string;
  expiresIn?: number;
}

/**
 * Map backend AccountStatus enum to frontend enum
 * @param backendStatus - Backend status value (PENDING_VERIFICATION, ACTIVE, INACTIVE)
 * @returns Frontend AccountStatus enum value
 */
function mapAccountStatus(backendStatus: string): AccountStatus {
  switch (backendStatus) {
    case 'PENDING_VERIFICATION':
      return AccountStatus.PENDING;
    case 'ACTIVE':
      return AccountStatus.ACTIVE;
    case 'INACTIVE':
      return AccountStatus.DEACTIVATED;
    default:
      return AccountStatus.PENDING;
  }
}

/**
 * Get current user profile
 *
 * @returns Promise resolving to profile data
 * @throws Error if user is not authenticated or request fails
 *
 * @example
 * ```typescript
 * const profile = await getProfile();
 * console.log(profile.email, profile.firstName);
 * ```
 */
export async function getProfile(): Promise<ProfileData> {
  const response: AxiosResponse<AuthStatusResponse> = await axios.get('cloud-api/auth/me', {
    showSuccessToast: false,
  });

  // Extract user object and handle unauthenticated state
  if (!response.data.isAuthenticated || !response.data.user) {
    throw new Error('User is not authenticated');
  }

  // Map backend response to frontend ProfileData format
  const user = response.data.user;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    phoneCountry: user.phoneCountry,
    accountStatus: mapAccountStatus(user.accountStatus),
    locale: user.locale,
    timezone: user.timezone,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    profilePictureUrl: user.profilePictureUrl,
  };
}

/**
 * Update user profile
 *
 * @param data - Profile fields to update
 * @returns Promise resolving to updated profile data
 * @throws Error if validation fails or request fails
 *
 * @example
 * ```typescript
 * const updated = await updateProfile({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   phone: '+1234567890',
 * });
 * ```
 */
export async function updateProfile(data: UpdateProfileDto): Promise<ProfileData> {
  const response: AxiosResponse<ProfileData> = await axios.put(
    'cloud-api/users/profile',
    data,
    {
      loadingMessage: 'Updating profile...',
      successMessage: 'Profile updated successfully',
    }
  );

  return response.data;
}

/**
 * Change user password
 *
 * @param data - Current and new password
 * @returns Promise that resolves when password is changed
 * @throws Error if current password is incorrect or validation fails
 *
 * @example
 * ```typescript
 * await changePassword({
 *   currentPassword: 'OldPass123!',
 *   newPassword: 'NewPass456!',
 * });
 * ```
 */
export async function changePassword(data: ChangePasswordDto): Promise<void> {
  await axios.post('cloud-api/auth/password/change', data, {
    loadingMessage: 'Changing password...',
    successMessage: 'Password changed successfully',
  });
}

/**
 * Get list of active sessions
 *
 * @returns Promise resolving to array of sessions
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * const sessions = await getSessions();
 * const current = sessions.find(s => s.isCurrent);
 * ```
 */
export async function getSessions(): Promise<Session[]> {
  const response: AxiosResponse<Session[]> = await axios.get('cloud-api/auth/sessions', {
    showSuccessToast: false,
  });

  return response.data;
}

/**
 * Revoke a specific session
 *
 * @param sessionId - ID of session to revoke
 * @returns Promise that resolves when session is revoked
 * @throws Error if session not found or is current session
 *
 * @example
 * ```typescript
 * await revokeSession('session-id-123');
 * ```
 */
export async function revokeSession(sessionId: string): Promise<void> {
  await axios.delete(`cloud-api/auth/sessions/${sessionId}`, {
    loadingMessage: 'Revoking session...',
    successMessage: 'Session revoked successfully',
  });
}

/**
 * Logout from all other devices (revoke all sessions except current)
 *
 * @returns Promise that resolves when all other sessions are revoked
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * await revokeAllOtherSessions();
 * ```
 */
export async function revokeAllOtherSessions(): Promise<void> {
  await axios.post('cloud-api/auth/logout-all', null, {
    loadingMessage: 'Signing out all devices...',
    successMessage: 'Signed out from all other devices',
  });
}

/**
 * Delete user account permanently
 *
 * @returns Promise that resolves when account is deleted
 * @throws Error if request fails
 *
 * @example
 * ```typescript
 * await deleteAccount();
 * // User is logged out and redirected
 * ```
 */
export async function deleteAccount(): Promise<void> {
  await axios.delete('cloud-api/users/account', {
    loadingMessage: 'Deleting account...',
    successMessage: 'Account deleted successfully',
  });
}
