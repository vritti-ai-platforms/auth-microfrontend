import { axios } from '@vritti/quantum-ui/axios';
import type { CloudProvider, CreateCloudProviderData } from '@/schemas/admin/cloud-providers';

// Fetches all cloud providers
export function getCloudProviders(): Promise<CloudProvider[]> {
  return axios.get<CloudProvider[]>('admin-api/providers').then((r) => r.data);
}

// Creates a new cloud provider
export function createCloudProvider(data: CreateCloudProviderData): Promise<CloudProvider> {
  return axios.post<CloudProvider>('admin-api/providers', data).then((r) => r.data);
}

// Deletes a cloud provider by ID
export function deleteCloudProvider(id: string): Promise<void> {
  return axios.delete(`admin-api/providers/${id}`).then(() => undefined);
}
