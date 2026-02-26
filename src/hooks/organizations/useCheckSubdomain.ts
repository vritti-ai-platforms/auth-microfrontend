import { type SubdomainAvailability } from '@schemas/organizations';
import { checkSubdomain } from '@services/organizations.service';
import { type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

type UseCheckSubdomainOptions = Omit<UseMutationOptions<SubdomainAvailability, AxiosError, string>, 'mutationFn'>;

// Mutation to check if a subdomain is available before org creation
export function useCheckSubdomain(options?: UseCheckSubdomainOptions) {
  return useMutation<SubdomainAvailability, AxiosError, string>({
    mutationFn: checkSubdomain,
    ...options,
  });
}
