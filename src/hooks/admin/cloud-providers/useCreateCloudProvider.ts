import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CloudProvider, CreateCloudProviderData } from '@/schemas/admin/cloud-providers';
import { createCloudProvider } from '@/services/admin/cloud-providers.service';
import { CLOUD_PROVIDERS_QUERY_KEY } from './useCloudProviders';

type UseCreateCloudProviderOptions = Omit<
  UseMutationOptions<CloudProvider, AxiosError, CreateCloudProviderData>,
  'mutationFn'
>;

// Creates a new provider and immediately adds it to the cached list
export function useCreateCloudProvider(options?: UseCreateCloudProviderOptions) {
  const queryClient = useQueryClient();
  return useMutation<CloudProvider, AxiosError, CreateCloudProviderData>({
    mutationFn: createCloudProvider,
    onSuccess: (newProvider, ...args) => {
      queryClient.setQueryData<CloudProvider[]>(
        CLOUD_PROVIDERS_QUERY_KEY,
        (old = []) => [...old, newProvider],
      );
      options?.onSuccess?.(newProvider, ...args);
    },
    ...options,
  });
}
