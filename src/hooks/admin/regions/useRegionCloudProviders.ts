import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { RegionCloudProvider } from '@/schemas/admin/regions';
import { getRegionCloudProviders } from '../../../services/admin/regions.service';

// Fetches the cloud providers assigned to a region
export function useRegionCloudProviders(
  regionId: string,
  options?: Omit<UseQueryOptions<RegionCloudProvider[], AxiosError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<RegionCloudProvider[], AxiosError>({
    queryKey: ['admin', 'regions', regionId, 'cloud-providers'],
    queryFn: () => getRegionCloudProviders(regionId),
    ...options,
  });
}
