import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProfileData, UpdateProfileDto } from '../schemas/settings';
import { deleteAccount, getProfile, updateProfile } from '../services/settings.service';

/**
 * Query key for profile data
 */
export const PROFILE_QUERY_KEY = ['profile'] as const;

/**
 * Fetch current user profile
 *
 * @param options - Optional TanStack Query options
 * @returns Query result with profile data
 *
 * @example
 * ```typescript
 * const { data: profile, isLoading, error } = useProfile();
 *
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorMessage />;
 *
 * return <div>{profile.email}</div>;
 * ```
 */
export const useProfile = (options?: Omit<UseQueryOptions<ProfileData, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<ProfileData, Error>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => getProfile(),
    ...options,
  });
};

type UseUpdateProfileOptions = Omit<UseMutationOptions<ProfileData, Error, UpdateProfileDto>, 'mutationFn'>;

/**
 * Mutation to update user profile
 *
 * @param options - Optional mutation options (onSuccess, onError, etc.)
 * @returns Mutation result
 *
 * @example
 * ```typescript
 * const updateProfileMutation = useUpdateProfile({
 *   onSuccess: (data) => {
 *     console.log('Profile updated:', data);
 *   },
 * });
 *
 * const handleSubmit = (formData) => {
 *   updateProfileMutation.mutate({
 *     firstName: formData.firstName,
 *     lastName: formData.lastName,
 *   });
 * };
 * ```
 */
export const useUpdateProfile = (options?: UseUpdateProfileOptions) => {
  const queryClient = useQueryClient();

  return useMutation<ProfileData, Error, UpdateProfileDto>({
    mutationFn: (data: UpdateProfileDto) => updateProfile(data),
    onSuccess: (data, ...args) => {
      // Update cache with new profile data
      queryClient.setQueryData(PROFILE_QUERY_KEY, data);
      options?.onSuccess?.(data, ...args);
    },
    ...options,
  });
};

type UseDeleteAccountOptions = Omit<UseMutationOptions<void, Error, void>, 'mutationFn'>;

/**
 * Mutation to delete user account
 *
 * @param options - Optional mutation options (onSuccess, onError, etc.)
 * @returns Mutation result
 *
 * @example
 * ```typescript
 * const deleteAccountMutation = useDeleteAccount({
 *   onSuccess: () => {
 *     // Clear all data and redirect to login
 *     navigate('/login');
 *   },
 * });
 *
 * const handleDelete = () => {
 *   if (confirm('Are you sure?')) {
 *     deleteAccountMutation.mutate();
 *   }
 * };
 * ```
 */
export const useDeleteAccount = (options?: UseDeleteAccountOptions) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: () => deleteAccount(),
    onSuccess: (...args) => {
      // Clear all cached data
      queryClient.clear();
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};
