import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { OrgListItem } from '@schemas/organizations';
import { getMyOrgs } from '@services/organizations.service';

export const MY_ORGS_QUERY_KEY = ['organizations', 'me'] as const;

// Fetches the list of organizations the current user belongs to
export function useMyOrgs(options?: Omit<UseQueryOptions<OrgListItem[], AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery<OrgListItem[], AxiosError>({
    queryKey: MY_ORGS_QUERY_KEY,
    queryFn: getMyOrgs,
    ...options,
  });
}
