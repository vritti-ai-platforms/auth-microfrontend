import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getMobileVerificationStatus, type MobileVerificationStatusResponse } from '../../services/onboarding.service';

type UseMobileVerificationStatusOptions = Omit<
  UseQueryOptions<MobileVerificationStatusResponse, AxiosError>,
  'queryKey' | 'queryFn'
>;

export function useMobileVerificationStatus(
  enabled: boolean = true,
  refetchInterval: number = 3000,
  options?: UseMobileVerificationStatusOptions,
) {
  return useQuery<MobileVerificationStatusResponse, AxiosError>({
    queryKey: ['mobile-verification', 'status'],
    queryFn: getMobileVerificationStatus,
    enabled,
    refetchInterval: enabled ? refetchInterval : false,
    staleTime: 0,
    ...options,
  });
}
