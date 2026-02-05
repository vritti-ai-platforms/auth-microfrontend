import { useCallback, useEffect, useState } from 'react';
import {
  useMobileVerificationSSE,
  type VerificationSSEEvent,
} from './useMobileVerificationSSE';

export interface UseMobileVerificationRealtimeOptions {
  /** Whether to enable real-time updates */
  enabled?: boolean;
  /** Called when verification succeeds */
  onVerified?: () => void;
  /** Called when verification fails */
  onFailed?: (message?: string) => void;
  /** Called when verification expires */
  onExpired?: () => void;
}

/**
 * Hook for mobile verification status via SSE (Server-Sent Events)
 *
 * Uses SSE for real-time push notifications when verification status changes.
 * No polling - purely event-driven.
 *
 * @example
 * ```tsx
 * const { isVerified, isConnected, connectionMode } = useMobileVerificationRealtime({
 *   enabled: showQRCode,
 *   onVerified: () => advanceToNextStep(),
 *   onExpired: () => handleBackToMethods(),
 * });
 * ```
 */
export const useMobileVerificationRealtime = (
  options: UseMobileVerificationRealtimeOptions = {},
) => {
  const {
    enabled = true,
    onVerified,
    onFailed,
    onExpired,
  } = options;

  const [isVerified, setIsVerified] = useState(false);

  // Store callbacks in refs to avoid dependency issues
  const onVerifiedRef = useCallback(() => {
    setIsVerified(true);
    onVerified?.();
  }, [onVerified]);

  const onFailedRef = useCallback(
    (event: VerificationSSEEvent) => {
      onFailed?.(event.message);
    },
    [onFailed],
  );

  const onExpiredRef = useCallback(() => {
    onExpired?.();
  }, [onExpired]);

  // SSE connection (no polling fallback)
  const { isConnected: sseConnected, error: sseError } = useMobileVerificationSSE({
    enabled,
    onVerified: onVerifiedRef,
    onFailed: onFailedRef,
    onExpired: onExpiredRef,
  });

  // Reset state when disabled
  useEffect(() => {
    if (!enabled) {
      setIsVerified(false);
    }
  }, [enabled]);

  const connectionMode = sseConnected ? 'sse' : 'disconnected';

  return {
    isVerified,
    isConnected: sseConnected,
    connectionMode,
    sseError,
  };
};
