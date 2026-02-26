import { z } from 'zod';

export enum OrgPlan {
  free = 'free',
  pro = 'pro',
  enterprise = 'enterprise',
}

export enum OrgSize {
  s0_10 = '0-10',
  s10_20 = '10-20',
  s20_50 = '20-50',
  s50_100 = '50-100',
  s100_500 = '100-500',
  s500plus = '500+',
}

export enum OrgMemberRole {
  Owner = 'Owner',
  Admin = 'Admin',
}

export interface OrgListItem {
  id: string;
  name: string;
  subdomain: string;
  orgIdentifier: string;
  industryId: number | null;
  size: OrgSize;
  mediaId: number | null;
  plan: OrgPlan;
  role: OrgMemberRole;
  createdAt: string;
}

// Zod schema for create org form
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  subdomain: z
    .string()
    .min(1, 'URL is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  size: z.enum(Object.values(OrgSize) as [OrgSize, ...OrgSize[]], { message: 'Please select a size' }),
  plan: z.enum(Object.values(OrgPlan) as [OrgPlan, ...OrgPlan[]]),
  industryId: z.number().optional(),
  industryName: z.string().optional(),
});

// Use output type so plan is always OrgPlan (never undefined) after .default()
export type CreateOrgFormData = z.output<typeof createOrganizationSchema>;

export interface SubdomainAvailability {
  available: boolean;
}

// What gets sent to the API
export interface CreateOrgDto {
  name: string;
  subdomain: string;
  orgIdentifier: string; // auto-set to subdomain value on submit
  size: OrgSize;
  plan?: OrgPlan;
  industryId?: number;
}
