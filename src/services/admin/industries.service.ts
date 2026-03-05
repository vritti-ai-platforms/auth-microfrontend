import { axios } from '@vritti/quantum-ui/axios';
import type { CreateIndustryData, Industry, IndustriesResponse } from '@/schemas/admin/industries';

// Fetches all industries — server applies filter/sort state
export function getIndustries(): Promise<IndustriesResponse> {
  return axios.get<IndustriesResponse>('admin-api/industries').then((r) => r.data);
}

// Creates a new industry
export function createIndustry(data: CreateIndustryData): Promise<{ success: boolean; message: string }> {
  return axios.post<{ success: boolean; message: string }>('admin-api/industries', data).then((r) => r.data);
}

// Deletes an industry by ID
export function deleteIndustry(id: string): Promise<void> {
  return axios.delete(`admin-api/industries/${id}`).then(() => undefined);
}
