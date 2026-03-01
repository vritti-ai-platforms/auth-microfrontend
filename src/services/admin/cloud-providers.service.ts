import { axios } from '@vritti/quantum-ui/axios';
import type { TableViewState } from '@vritti/quantum-ui/table-filter';
import type { CloudProvider, CreateCloudProviderData } from '@/schemas/admin/cloud-providers';

export interface CloudProvidersResponse {
  data: CloudProvider[];
  state: TableViewState;
}

// Fetches all cloud providers with server-stored filter/sort state
export function getCloudProviders(
  search?: { columnId: string; value: string },
): Promise<CloudProvidersResponse> {
  return axios
    .get<CloudProvidersResponse>('admin-api/cloud-providers', {
      params: search ? { searchColumn: search.columnId, searchValue: search.value } : undefined,
    })
    .then((r) => r.data);
}

// Creates a new cloud provider
export function createCloudProvider(data: CreateCloudProviderData): Promise<CloudProvider> {
  return axios.post<CloudProvider>('admin-api/cloud-providers', data).then((r) => r.data);
}

// Deletes a cloud provider by ID
export function deleteCloudProvider(id: string): Promise<void> {
  return axios.delete(`admin-api/cloud-providers/${id}`).then(() => undefined);
}
