import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CloudProvider } from '@/schemas/admin/cloud-providers';
import { getCloudProviders } from '../../../services/admin/cloud-providers.service';

export const CLOUD_PROVIDERS_QUERY_KEY = ['admin', 'cloud-providers'] as const;

// Fetches all cloud providers
export function useCloudProviders(
  options?: Omit<UseQueryOptions<CloudProvider[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CloudProvider[], AxiosError>({
    queryKey: CLOUD_PROVIDERS_QUERY_KEY,
    queryFn: getCloudProviders,
    ...options,
  });
}
