import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProfileData, UpdateProfileDto } from '../schemas/settings';
import { deleteAccount, getProfile, updateProfile } from '../services/settings.service';

export const PROFILE_QUERY_KEY = ['profile'] as const;

export function useProfile(options?: Omit<UseQueryOptions<ProfileData, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<ProfileData, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: getProfile,
    ...options,
  });
}

type UseUpdateProfileOptions = Omit<UseMutationOptions<ProfileData, Error, UpdateProfileDto>, 'mutationFn'>;

export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const queryClient = useQueryClient();

  return useMutation<ProfileData, Error, UpdateProfileDto>({
    mutationFn: updateProfile,
    onSuccess: (data, ...args) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      options?.onSuccess?.(data, ...args);
    },
    ...options,
  });
}

type UseDeleteAccountOptions = Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>;

export function useDeleteAccount(options?: UseDeleteAccountOptions) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: deleteAccount,
    onSuccess: (...args) => {
      queryClient.clear();
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
