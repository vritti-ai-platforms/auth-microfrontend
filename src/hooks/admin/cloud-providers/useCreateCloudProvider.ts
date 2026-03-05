import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateCloudProviderData } from '@/schemas/admin/cloud-providers';
import { createCloudProvider } from '../../../services/admin/cloud-providers.service';
import { CLOUD_PROVIDERS_QUERY_KEY } from './useCloudProviders';

type UseCreateCloudProviderOptions = Omit<
  UseMutationOptions<{ success: boolean; message: string }, AxiosError, CreateCloudProviderData>,
  'mutationFn'
>;

// Creates a new provider and invalidates the providers list
export function useCreateCloudProvider(options?: UseCreateCloudProviderOptions) {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: string }, AxiosError, CreateCloudProviderData>({
    ...options,
    mutationFn: createCloudProvider,
    onSuccess: (result, ...args) => {
      queryClient.invalidateQueries({ queryKey: CLOUD_PROVIDERS_QUERY_KEY });
      options?.onSuccess?.(result, ...args);
    },
  });
}
