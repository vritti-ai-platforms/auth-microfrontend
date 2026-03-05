import { z } from 'zod';
import type { TableViewState } from '@vritti/quantum-ui/table-filter';

export interface Industry {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface IndustriesResponse {
  data: Industry[];
  state: TableViewState;
  activeViewId: string | null;
}

export const createIndustrySchema = z.object({
  name: z.string().min(1, 'Industry name is required'),
  code: z.string().min(1, 'Industry code is required').max(100, 'Code must be 100 characters or less'),
  slug: z.string().min(1, 'Industry slug is required').max(100, 'Slug must be 100 characters or less'),
  description: z.string().optional(),
});

export type CreateIndustryData = z.infer<typeof createIndustrySchema>;
