import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { addCloudProvider } from '../../../services/admin/regions.service';

interface AddCloudProviderVariables {
  regionId: string;
  providerId: string;
}

type UseAddCloudProviderOptions = Omit<UseMutationOptions<void, AxiosError, AddCloudProviderVariables>, 'mutationFn'>;

// Assigns a cloud provider to a region and invalidates the region's provider list
export function useAddCloudProvider(options?: UseAddCloudProviderOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, AddCloudProviderVariables>({
    mutationFn: ({ regionId, providerId }) => addCloudProvider(regionId, providerId),
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'regions', variables.regionId, 'cloud-providers'] });
      options?.onSuccess?.(data, variables, ...args);
    },
    ...options,
  });
}
