import { useCallback, useEffect, useRef, useState } from 'react';
import { getToken } from '@vritti/quantum-ui/axios';
import { getConfig } from '@vritti/quantum-ui';

export interface VerificationSSEEvent {
  type: 'verified' | 'failed' | 'expired';
  verificationId: string;
  phone?: string;
  message?: string;
  timestamp: string;
}

export interface UseMobileVerificationSSEOptions {
  /** Called when verification succeeds */
  onVerified?: (event: VerificationSSEEvent) => void;
  /** Called when verification fails */
  onFailed?: (event: VerificationSSEEvent) => void;
  /** Called when verification expires */
  onExpired?: (event: VerificationSSEEvent) => void;
  /** Called on connection error */
  onError?: (error: Event) => void;
  /** Called when connection opens */
  onOpen?: () => void;
  /** Whether SSE should be enabled */
  enabled?: boolean;
}

/**
 * Hook for receiving real-time mobile verification updates via SSE
 *
 * @example
 * ```tsx
 * const { isConnected, error } = useMobileVerificationSSE({
 *   enabled: isWaitingForVerification,
 *   onVerified: () => {
 *     // Navigate to next step
 *     refetch();
 *   },
 *   onFailed: (event) => {
 *     setError(event.message);
 *   },
 *   onExpired: () => {
 *     setError('Verification expired. Please try again.');
 *   },
 * });
 * ```
 */
export const useMobileVerificationSSE = (options: UseMobileVerificationSSEOptions = {}) => {
  const { onVerified, onFailed, onExpired, onError, onOpen, enabled = true } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store callbacks in refs to avoid re-creating EventSource on callback changes
  const callbacksRef = useRef({ onVerified, onFailed, onExpired, onError, onOpen });
  callbacksRef.current = { onVerified, onFailed, onExpired, onError, onOpen };

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }

    // Get token for authentication
    const token = getToken();
    if (!token) {
      setError('No authentication token available');
      return;
    }

    // Create SSE URL with token as query parameter
    // (EventSource API doesn't support custom headers)
    // Get API base URL from quantum-ui config (e.g., '/api')
    // Convert relative URL to absolute using window.location.origin
    const config = getConfig();
    const apiBaseUrl = config.axios.baseURL;
    const baseUrl = apiBaseUrl.startsWith('http')
      ? apiBaseUrl
      : `${window.location.origin}${apiBaseUrl}`;
    const sseUrl = `${baseUrl}/cloud-api/onboarding/mobile-verification/events?token=${encodeURIComponent(token)}`;

    // EventSource with credentials for cookie-based CORS
    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      callbacksRef.current.onOpen?.();
    };

    eventSource.onerror = (event) => {
      setIsConnected(false);

      // EventSource automatically reconnects on error
      // Only set error if connection is truly closed
      if (eventSource.readyState === EventSource.CLOSED) {
        setError('Connection lost. Falling back to polling.');
        callbacksRef.current.onError?.(event);
      }
    };

    // Listen for verification events
    eventSource.addEventListener('verification', (event: MessageEvent) => {
      try {
        const data: VerificationSSEEvent = JSON.parse(event.data);

        switch (data.type) {
          case 'verified':
            callbacksRef.current.onVerified?.(data);
            // Close connection after verified
            disconnect();
            break;
          case 'failed':
            callbacksRef.current.onFailed?.(data);
            break;
          case 'expired':
            callbacksRef.current.onExpired?.(data);
            disconnect();
            break;
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    });

    return () => {
      disconnect();
    };
  }, [enabled, disconnect]);

  return {
    isConnected,
    error,
    disconnect,
  };
};
