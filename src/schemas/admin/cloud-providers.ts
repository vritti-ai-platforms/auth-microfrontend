import { z } from 'zod';

export interface CloudProvider {
  id: string;
  name: string;
  code: string;
  regionCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export const createCloudProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  code: z.string().min(1, 'Provider code is required').max(100, 'Code must be 100 characters or less'),
});

export type CreateCloudProviderData = z.infer<typeof createCloudProviderSchema>;
