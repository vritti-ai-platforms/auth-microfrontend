import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChangePasswordDto, Session } from '../schemas/settings';
import {
  changePassword,
  getSessions,
  revokeAllOtherSessions,
  revokeSession,
} from '../services/settings.service';

/**
 * Query key for sessions data
 */
export const SESSIONS_QUERY_KEY = ['sessions'] as const;

/**
 * Mutation to change user password
 *
 * @param options - Optional mutation options (onSuccess, onError, etc.)
 * @returns Mutation result
 *
 * @example
 * ```typescript
 * const changePasswordMutation = useChangePassword({
 *   onSuccess: () => {
 *     form.reset();
 *     toast.success('Password changed successfully');
 *   },
 * });
 *
 * const handleSubmit = (data) => {
 *   changePasswordMutation.mutate({
 *     currentPassword: data.currentPassword,
 *     newPassword: data.newPassword,
 *   });
 * };
 * ```
 */
export const useChangePassword = (
  options?: Omit<UseMutationOptions<void, Error, ChangePasswordDto>, 'mutationFn'>
) => {
  return useMutation<void, Error, ChangePasswordDto>({
    mutationFn: (data: ChangePasswordDto) => changePassword(data),
    ...options,
  });
};

/**
 * Fetch list of active sessions
 *
 * @param options - Optional TanStack Query options
 * @returns Query result with sessions data
 *
 * @example
 * ```typescript
 * const { data: sessions, isLoading } = useSessions();
 *
 * const currentSession = sessions?.find(s => s.isCurrent);
 * const otherSessions = sessions?.filter(s => !s.isCurrent);
 * ```
 */
export const useSessions = (
  options?: Omit<UseQueryOptions<Session[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Session[], Error>({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: () => getSessions(),
    ...options,
  });
};

/**
 * Mutation to revoke a specific session
 *
 * @param options - Optional mutation options (onSuccess, onError, etc.)
 * @returns Mutation result
 *
 * @example
 * ```typescript
 * const revokeSessionMutation = useRevokeSession({
 *   onSuccess: () => {
 *     toast.success('Session revoked');
 *   },
 * });
 *
 * const handleRevoke = (sessionId: string) => {
 *   revokeSessionMutation.mutate(sessionId);
 * };
 * ```
 */
export const useRevokeSession = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: (...args) => {
      // Refetch sessions list
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

/**
 * Mutation to revoke all other sessions (sign out all devices)
 *
 * @param options - Optional mutation options (onSuccess, onError, etc.)
 * @returns Mutation result
 *
 * @example
 * ```typescript
 * const revokeAllMutation = useRevokeAllOtherSessions({
 *   onSuccess: () => {
 *     toast.success('Signed out from all other devices');
 *   },
 * });
 *
 * const handleSignOutAll = () => {
 *   if (confirm('Sign out all other devices?')) {
 *     revokeAllMutation.mutate();
 *   }
 * };
 * ```
 */
export const useRevokeAllOtherSessions = (
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => revokeAllOtherSessions(),
    onSuccess: (...args) => {
      // Refetch sessions list
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};
