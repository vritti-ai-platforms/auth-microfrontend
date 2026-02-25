import type { IndustryOption } from '@schemas/organizations';
import { getIndustries } from '@services/industries.service';
import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export const INDUSTRIES_QUERY_KEY = ['industries'] as const;

// Fetches all available industries; cached for 5 minutes
export function useIndustries(options?: Omit<UseQueryOptions<IndustryOption[], AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<IndustryOption[], AxiosError>({
    queryKey: INDUSTRIES_QUERY_KEY,
    queryFn: getIndustries,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
