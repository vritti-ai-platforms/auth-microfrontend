import type { CreateOrgDto, OrgListItem } from '@schemas/organizations';
import { createOrganization } from '@services/organizations.service';
import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { MY_ORGS_QUERY_KEY } from './useMyOrgs';

type UseCreateOrgOptions = Omit<UseMutationOptions<OrgListItem, AxiosError, CreateOrgDto>, 'mutationFn'>;

// Mutation hook to create a new organization and invalidate the orgs list
export function useCreateOrganization(options?: UseCreateOrgOptions) {
  const queryClient = useQueryClient();
  return useMutation<OrgListItem, AxiosError, CreateOrgDto>({
    mutationFn: createOrganization,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: MY_ORGS_QUERY_KEY });
      options?.onSuccess?.(data, ...args);
    },
    ...options,
  });
}
