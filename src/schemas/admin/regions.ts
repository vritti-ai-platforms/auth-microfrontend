import { z } from 'zod';

export interface Region {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  providerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegionCloudProvider {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export const createRegionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  state: z.string().min(1, 'State is required'),
  city: z.string().min(1, 'City is required'),
});

export const updateRegionSchema = createRegionSchema.partial();

export type CreateRegionData = z.infer<typeof createRegionSchema>;
export type UpdateRegionData = z.infer<typeof updateRegionSchema>;
