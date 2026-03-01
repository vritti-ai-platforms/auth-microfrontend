import { axios } from '@vritti/quantum-ui/axios';
import type { TableViewState } from '@vritti/quantum-ui/table-filter';

export interface UpsertTableStateDto {
  tableSlug: string;
  state: TableViewState;
}

// Upserts the live filter/sort state for a table (called on filter apply and sort click)
export function upsertTableState(dto: UpsertTableStateDto): Promise<void> {
  return axios.post('table-states', dto).then(() => undefined);
}
