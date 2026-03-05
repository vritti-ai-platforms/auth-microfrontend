import { z } from 'zod';
import type { TableViewState } from '@vritti/quantum-ui/table-filter';

export interface Region {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  providerCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface RegionCloudProvider {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegionsResponse {
  data: Region[];
  state: TableViewState;
  activeViewId: string | null;
}

export const createRegionSchema = z.object({
  name: z.string().min(1, 'Region name is required'),
  code: z.string().min(1, 'Region code is required').max(100, 'Code must be 100 characters or less'),
  state: z.string().min(1, 'State is required').max(100),
  city: z.string().min(1, 'City is required').max(100),
});

export const updateRegionSchema = createRegionSchema.partial();

export type CreateRegionData = z.infer<typeof createRegionSchema>;
export type UpdateRegionData = z.infer<typeof updateRegionSchema>;
