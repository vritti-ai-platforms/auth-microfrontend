import { useCallback, useEffect, useState } from 'react';
import {
  useMobileVerificationSSE,
  type VerificationSSEEvent,
} from './useMobileVerificationSSE';

export interface UseMobileVerificationRealtimeOptions {
  enabled?: boolean;
  onVerified?: () => void;
  onFailed?: (message?: string) => void;
  onExpired?: () => void;
}

export function useMobileVerificationRealtime(
  options: UseMobileVerificationRealtimeOptions = {},
) {
  const {
    enabled = true,
    onVerified,
    onFailed,
    onExpired,
  } = options;

  const [isVerified, setIsVerified] = useState(false);

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

  const { isConnected: sseConnected, error: sseError } = useMobileVerificationSSE({
    enabled,
    onVerified: onVerifiedRef,
    onFailed: onFailedRef,
    onExpired: onExpiredRef,
  });

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
}
