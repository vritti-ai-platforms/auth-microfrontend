import { type UseMutationOptions, type UseQueryOptions, useMutation, useQuery } from '@tanstack/react-query';
import type {
  InitiateMobileVerificationDto,
  MobileVerificationStatusResponse,
} from '../services/onboarding.service';
import {
  getMobileVerificationStatus,
  initiateMobileVerification,
  resendMobileVerification,
  verifyMobileOtp,
} from '../services/onboarding.service';
import { useEffect, useState } from 'react';

/**
 * Hook for initiating mobile verification
 *
 * @param options - Optional mutation options
 * @returns Mutation result with initiateMobileVerification functionality
 */
export const useInitiateMobileVerification = (
  options?: Omit<UseMutationOptions<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>, 'mutationFn'>,
) => {
  return useMutation<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>({
    mutationFn: (data: InitiateMobileVerificationDto) => initiateMobileVerification(data),
    ...options,
  });
};

/**
 * Hook for getting mobile verification status
 *
 * @param options - Optional query options
 * @returns Query result with verification status
 */
export const useMobileVerificationStatus = (
  options?: Omit<UseQueryOptions<MobileVerificationStatusResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery<MobileVerificationStatusResponse, Error>({
    queryKey: ['mobileVerificationStatus'],
    queryFn: () => getMobileVerificationStatus(),
    ...options,
  });
};

/**
 * Hook for verifying mobile OTP
 *
 * @param options - Optional mutation options
 * @returns Mutation result with verifyMobileOtp functionality
 */
export const useVerifyMobileOtp = (
  options?: Omit<UseMutationOptions<{ success: boolean; message: string }, Error, string>, 'mutationFn'>,
) => {
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (otp: string) => verifyMobileOtp(otp),
    ...options,
  });
};

/**
 * Hook for resending mobile verification
 *
 * @param options - Optional mutation options
 * @returns Mutation result with resendMobileVerification functionality
 */
export const useResendMobileVerification = (
  options?: Omit<UseMutationOptions<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>, 'mutationFn'>,
) => {
  return useMutation<MobileVerificationStatusResponse, Error, InitiateMobileVerificationDto>({
    mutationFn: (data: InitiateMobileVerificationDto) => resendMobileVerification(data),
    ...options,
  });
};

/**
 * Hook for mobile verification with SSE (Server-Sent Events)
 *
 * Listens for real-time verification status updates via SSE endpoint.
 * Returns current verification status and automatically subscribes to updates.
 *
 * @param verificationId - The verification ID to monitor
 * @param options - Optional callback options
 * @returns Current verification status and connection state
 *
 * @example
 * ```typescript
 * const { status, isConnected } = useMobileVerificationSSE(verificationId, {
 *   onVerified: () => navigate('/next-step'),
 *   onError: (error) => console.error(error),
 * });
 * ```
 */
export const useMobileVerificationSSE = (
  verificationId?: string,
  options?: {
    onVerified?: () => void;
    onError?: (error: Error) => void;
  },
) => {
  const [status, setStatus] = useState<MobileVerificationStatusResponse | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!verificationId) return;

    const eventSource = new EventSource(
      `/cloud-api/onboarding/mobile-verification/status-stream/${verificationId}`,
    );

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as MobileVerificationStatusResponse;
        setStatus(data);

        if (data.isVerified) {
          options?.onVerified?.();
          eventSource.close();
        }
      } catch (error) {
        options?.onError?.(error as Error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      options?.onError?.(new Error('SSE connection failed'));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [verificationId, options]);

  return { status, isConnected };
};

/**
 * Hook for mobile verification with polling + SSE fallback
 *
 * Combines polling with SSE for reliable real-time updates.
 * Automatically handles connection failures and retries.
 *
 * @param verificationId - The verification ID to monitor
 * @param options - Configuration and callback options
 * @returns Current verification status and loading state
 *
 * @example
 * ```typescript
 * const { status, isLoading } = useMobileVerificationRealtime(verificationId, {
 *   pollingInterval: 2000,
 *   onVerified: () => navigate('/next-step'),
 * });
 * ```
 */
export const useMobileVerificationRealtime = (
  verificationId?: string,
  options?: {
    pollingInterval?: number;
    onVerified?: () => void;
    onError?: (error: Error) => void;
  },
) => {
  const { status: sseStatus, isConnected } = useMobileVerificationSSE(verificationId, options);

  // Fallback to polling if SSE is not connected
  const { data: pollingStatus, isLoading } = useQuery<MobileVerificationStatusResponse, Error>({
    queryKey: ['mobileVerificationStatus', verificationId],
    queryFn: () => getMobileVerificationStatus(),
    enabled: !!verificationId && !isConnected,
    refetchInterval: options?.pollingInterval ?? 2000,
    refetchIntervalInBackground: false,
  });

  // Use SSE status if available, otherwise use polling status
  const status = sseStatus || pollingStatus;

  // Call onVerified callback when verification completes
  useEffect(() => {
    if (status?.isVerified) {
      options?.onVerified?.();
    }
  }, [status?.isVerified, options]);

  return { status, isLoading };
};
