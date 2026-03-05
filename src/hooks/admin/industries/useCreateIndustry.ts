import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import type { CreateIndustryData, Industry } from '@/schemas/admin/industries';
import { createIndustry } from '../../../services/admin/industries.service';
import { INDUSTRIES_QUERY_KEY } from './useIndustries';

type UseCreateIndustryOptions = Omit<
  UseMutationOptions<Industry, AxiosError, CreateIndustryData>,
  'mutationFn'
>;

// Creates a new industry and invalidates the industries list
export function useCreateIndustry(options?: UseCreateIndustryOptions) {
  const queryClient = useQueryClient();
  return useMutation<Industry, AxiosError, CreateIndustryData>({
    mutationFn: createIndustry,
    onSuccess: (newIndustry, ...args) => {
      queryClient.invalidateQueries({ queryKey: INDUSTRIES_QUERY_KEY });
      options?.onSuccess?.(newIndustry, ...args);
    },
    ...options,
  });
}
