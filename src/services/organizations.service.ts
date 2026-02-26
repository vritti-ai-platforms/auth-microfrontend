import type { CreateOrgDto, OrgListItem, SubdomainAvailability } from '@schemas/organizations';
import { axios } from '@vritti/quantum-ui/axios';

// Fetches all organizations the current user belongs to
export function getMyOrgs(): Promise<OrgListItem[]> {
  return axios.get<OrgListItem[]>('cloud-api/organizations/me').then((r) => r.data);
}

// Creates a new organization for the current user
export function createOrganization(data: CreateOrgDto): Promise<OrgListItem> {
  return axios.post<OrgListItem>('cloud-api/organizations', data).then((r) => r.data);
}

// Checks if a subdomain is available; throws AxiosError (409) if already taken
export function checkSubdomain(subdomain: string): Promise<SubdomainAvailability> {
  return axios
    .get<SubdomainAvailability>('cloud-api/organizations/check-subdomain', { params: { subdomain } })
    .then((r) => r.data);
}
