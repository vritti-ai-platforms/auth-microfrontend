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
  onVerified?: (event: VerificationSSEEvent) => void;
  onFailed?: (event: VerificationSSEEvent) => void;
  onExpired?: (event: VerificationSSEEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  enabled?: boolean;
}

export function useMobileVerificationSSE(options: UseMobileVerificationSSEOptions = {}) {
  const { onVerified, onFailed, onExpired, onError, onOpen, enabled = true } = options;

  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const token = getToken();
    if (!token) {
      setError('No authentication token available');
      return;
    }

    const config = getConfig();
    const apiBaseUrl = config.axios.baseURL;
    const baseUrl = apiBaseUrl.startsWith('http')
      ? apiBaseUrl
      : `${window.location.origin}${apiBaseUrl}`;
    const sseUrl = `${baseUrl}/cloud-api/onboarding/mobile-verification/events?token=${encodeURIComponent(token)}`;

    const eventSource = new EventSource(sseUrl, { withCredentials: true });
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      callbacksRef.current.onOpen?.();
    };

    eventSource.onerror = (event) => {
      setIsConnected(false);
      if (eventSource.readyState === EventSource.CLOSED) {
        setError('Connection lost. Falling back to polling.');
        callbacksRef.current.onError?.(event);
      }
    };

    eventSource.addEventListener('verification', (event: MessageEvent) => {
      try {
        const data: VerificationSSEEvent = JSON.parse(event.data);

        switch (data.type) {
          case 'verified':
            callbacksRef.current.onVerified?.(data);
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
}
