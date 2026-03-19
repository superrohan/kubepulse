import { useEffect, useRef, useCallback } from 'react';

export function useAutoRefresh(callback, intervalMs = 10000, enabled = true) {
  const callbackRef = useRef(callback);
  const timerRef = useRef(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => callbackRef.current(), intervalMs);
  }, [intervalMs]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop]);

  return { stop, start };
}
