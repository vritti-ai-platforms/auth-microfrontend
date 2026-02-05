import { useCallback, useEffect, useState } from 'react';

interface UseResendTimerOptions {
  initialSeconds?: number;
  startImmediately?: boolean;
}

interface UseResendTimerReturn {
  secondsRemaining: number;
  isResendAvailable: boolean;
  reset: () => void;
}

export const useResendTimer = (
  options: UseResendTimerOptions = {}
): UseResendTimerReturn => {
  const { initialSeconds = 30, startImmediately = true } = options;

  const [secondsRemaining, setSecondsRemaining] = useState(
    startImmediately ? initialSeconds : 0
  );

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((s) => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const reset = useCallback(() => {
    setSecondsRemaining(initialSeconds);
  }, [initialSeconds]);

  return {
    secondsRemaining,
    isResendAvailable: secondsRemaining <= 0,
    reset,
  };
};
