import type { IndustryOption } from '@schemas/organizations';
import { axios } from '@vritti/quantum-ui/axios';

// Fetches all available industries for organization setup
export function getIndustries(): Promise<IndustryOption[]> {
  return axios
    .get<IndustryOption[]>('cloud-api/industries', { public: true, showSuccessToast: false })
    .then((r) => r.data);
}
