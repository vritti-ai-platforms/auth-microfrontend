import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  getMobileVerificationStatus,
  type MobileVerificationStatusResponse,
} from '../../services/onboarding.service';

type UseMobileVerificationStatusOptions = Omit<
  UseQueryOptions<MobileVerificationStatusResponse, Error>,
  'queryKey' | 'queryFn'
>;

/**
 * React Query hook for polling mobile verification status
 *
 * Use this hook to poll the verification status for webhook-based
 * verification methods (WHATSAPP_INBOUND, SMS_INBOUND).
 *
 * @param enabled - Whether to enable polling
 * @param refetchInterval - Polling interval in milliseconds (default: 3000)
 * @param options - Optional query options
 * @returns Query object with verification status
 *
 * @example
 * ```tsx
 * const [isPolling, setIsPolling] = useState(false);
 *
 * const { data: status, isLoading } = useMobileVerificationStatus(isPolling, 3000);
 *
 * useEffect(() => {
 *   if (status?.isVerified) {
 *     setIsPolling(false);
 *     // Handle verification complete
 *   }
 * }, [status?.isVerified]);
 * ```
 */
export const useMobileVerificationStatus = (
  enabled: boolean = true,
  refetchInterval: number = 3000,
  options?: UseMobileVerificationStatusOptions,
) => {
  return useQuery<MobileVerificationStatusResponse, Error>({
    queryKey: ['mobile-verification', 'status'],
    queryFn: getMobileVerificationStatus,
    enabled,
    refetchInterval: enabled ? refetchInterval : false,
    staleTime: 0, // Always refetch
    ...options,
  });
};
