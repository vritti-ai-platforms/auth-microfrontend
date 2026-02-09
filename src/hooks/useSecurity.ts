import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ChangePasswordDto, Session } from '../schemas/settings';
import {
  changePassword,
  getSessions,
  revokeAllOtherSessions,
  revokeSession,
} from '../services/settings.service';

export const SESSIONS_QUERY_KEY = ['sessions'] as const;

export function useChangePassword(
  options?: Omit<UseMutationOptions<void, Error, ChangePasswordDto>, 'mutationFn'>
) {
  return useMutation<void, Error, ChangePasswordDto>({
    mutationFn: changePassword,
    ...options,
  });
}

export function useSessions(
  options?: Omit<UseQueryOptions<Session[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Session[], Error>({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: getSessions,
    ...options,
  });
}

export function useRevokeSession(
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: revokeSession,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useRevokeAllOtherSessions(
  options?: Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: revokeAllOtherSessions,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
