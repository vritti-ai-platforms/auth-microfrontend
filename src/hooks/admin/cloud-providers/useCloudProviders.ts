import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type CloudProvidersResponse, getCloudProviders } from '../../../services/admin/cloud-providers.service';

export const CLOUD_PROVIDERS_QUERY_KEY = ['admin', 'cloud-providers'] as const;

// Fetches all cloud providers, optionally filtered by a backend search param
export function useCloudProviders(
  search?: { columnId: string; value: string } | null,
  options?: Omit<UseQueryOptions<CloudProvidersResponse, AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<CloudProvidersResponse, AxiosError>({
    queryKey: [...CLOUD_PROVIDERS_QUERY_KEY, search ?? null],
    queryFn: () => getCloudProviders(search ?? undefined),
    ...options,
  });
}
