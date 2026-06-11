import { useEffect, useRef, useState } from 'react';

export interface PollingState<T> {
  data: T | null;
  error: string | null;
  errorValue: unknown;
}

export function usePolling<T>(
  fetcher: () => Promise<T>,
  stopWhen: (data: T) => boolean,
  intervalMs = 4000,
  isFatal?: (err: unknown) => boolean,
): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorValue, setErrorValue] = useState<unknown>(null);
  const stopped = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stopped.current = false;

    const tick = async () => {
      try {
        const result = await fetcher();
        if (stopped.current) return;
        setData(result);
        setError(null);
        setErrorValue(null);
        if (stopWhen(result)) {
          stopped.current = true;
          return;
        }
      } catch (err) {
        if (stopped.current) return;
        setError(err instanceof Error ? err.message : '未知错误');
        setErrorValue(err);
        if (isFatal?.(err)) {
          stopped.current = true;
          return;
        }
      }
      if (!stopped.current) timer.current = setTimeout(tick, intervalMs);
    };

    void tick();

    return () => {
      stopped.current = true;
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, error, errorValue };
}
