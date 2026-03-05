import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { Region } from '@/schemas/admin/regions';
import { getRegions } from '../../../services/admin/regions.service';

export const REGIONS_QUERY_KEY = ['admin', 'regions'] as const;

// Fetches all regions
export function useRegions(options?: Omit<UseQueryOptions<Region[], AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<Region[], AxiosError>({
    queryKey: REGIONS_QUERY_KEY,
    queryFn: getRegions,
    ...options,
  });
}
