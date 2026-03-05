import { axios } from '@vritti/quantum-ui/axios';
import type { TableViewState } from '@vritti/quantum-ui/table-filter';
import type { CloudProvider, CreateCloudProviderData } from '@/schemas/admin/cloud-providers';

export interface CloudProvidersResponse {
  data: CloudProvider[];
  state: TableViewState;
  activeViewId: string | null;
}

// Fetches all cloud providers — server applies filter/sort state from Redis
export function getCloudProviders(): Promise<CloudProvidersResponse> {
  return axios.get<CloudProvidersResponse>('admin-api/cloud-providers').then((r) => r.data);
}

// Creates a new cloud provider
export function createCloudProvider(data: CreateCloudProviderData): Promise<{ success: boolean; message: string }> {
  return axios.post<{ success: boolean; message: string }>('admin-api/cloud-providers', data).then((r) => r.data);
}

// Deletes a cloud provider by ID
export function deleteCloudProvider(id: string): Promise<void> {
  return axios.delete(`admin-api/cloud-providers/${id}`).then(() => undefined);
}
