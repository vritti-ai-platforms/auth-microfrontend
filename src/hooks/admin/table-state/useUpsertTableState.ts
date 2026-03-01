import { type UseMutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { type UpsertTableStateDto, upsertTableState } from '../../../services/admin/table-state.service';

type UseUpsertTableStateOptions = Omit<UseMutationOptions<void, AxiosError, UpsertTableStateDto>, 'mutationFn'>;

// Upserts the live filter/sort state for a table, then re-fetches affected queries
export function useUpsertTableState(tableSlug: string, options?: UseUpsertTableStateOptions) {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, UpsertTableStateDto>({
    mutationFn: upsertTableState,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['admin', tableSlug] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}
