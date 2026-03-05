import { axios } from '@vritti/quantum-ui/axios';
import type { CreateRegionData, Region, RegionCloudProvider, RegionsResponse, UpdateRegionData } from '@/schemas/admin/regions';

// Fetches all regions — server applies filter/sort state
export function getRegions(): Promise<RegionsResponse> {
  return axios.get<RegionsResponse>('admin-api/regions').then((r) => r.data);
}

// Fetches a single region by ID
export function getRegion(id: string): Promise<Region> {
  return axios.get<Region>(`admin-api/regions/${id}`).then((r) => r.data);
}

// Creates a new region
export function createRegion(data: CreateRegionData): Promise<{ success: boolean; message: string }> {
  return axios.post<{ success: boolean; message: string }>('admin-api/regions', data).then((r) => r.data);
}

// Updates an existing region by ID
export function updateRegion(id: string, data: UpdateRegionData): Promise<Region> {
  return axios.patch<Region>(`admin-api/regions/${id}`, data).then((r) => r.data);
}

// Deletes a region by ID
export function deleteRegion(id: string): Promise<void> {
  return axios.delete(`admin-api/regions/${id}`).then(() => undefined);
}

// Fetches the cloud providers assigned to a region
export function getRegionCloudProviders(regionId: string): Promise<RegionCloudProvider[]> {
  return axios.get<RegionCloudProvider[]>(`admin-api/regions/${regionId}/cloud-providers`).then((r) => r.data);
}

// Assigns a cloud provider to a region
export function addCloudProvider(regionId: string, providerId: string): Promise<void> {
  return axios
    .post(`admin-api/regions/${regionId}/cloud-providers`, { cloudProviderIds: [providerId] })
    .then(() => undefined);
}

// Removes a cloud provider from a region
export function removeCloudProvider(regionId: string, providerId: string): Promise<void> {
  return axios.delete(`admin-api/regions/${regionId}/cloud-providers/${providerId}`).then(() => undefined);
}
