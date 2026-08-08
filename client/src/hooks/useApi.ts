/**
 * Hook: useApi
 * Responsibility: run an API call and expose it as { data, loading, error, retry }.
 *
 * This is the one piece of async state handling in the app. A data fetching
 * library (React Query, SWR) would bring caching, deduping and background
 * revalidation that a single-page landing site never exercises — the page loads
 * once and each section fetches once.
 *
 * Two behaviours are worth knowing:
 *
 * - The previous data is KEPT while a refetch is in flight. The portfolio
 *   refetches on every filter click, and blanking the grid each time would make
 *   the page jump. Callers can show a subtle loading state instead.
 * - Every request is aborted on unmount or when the dependencies change, so a
 *   slow response for "gastronomía" can never overwrite a newer one for "salud".
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError } from '../api/http.js';

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  /** Human readable message, ready to render. Null while things are fine. */
  error: string | null;
  /** Re-runs the request. Passed to the error state's retry button. */
  retry: () => void;
}

/**
 * Fetches data from the API and tracks its lifecycle.
 *
 * @param fetcher - Function performing the request. Must forward the AbortSignal.
 * @param deps - Values that should trigger a refetch when they change.
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Kept in a ref so changing the fetcher identity between renders does not
  // retrigger the effect — `deps` is the intended trigger.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setLoading(true);
    setError(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!active) return;
        setData(result);
      })
      .catch((cause: unknown) => {
        // An aborted request is not a failure: it means we asked for something
        // newer, or the component went away.
        if (controller.signal.aborted || !active) return;

        setError(
          cause instanceof ApiError
            ? cause.message
            : 'No pudimos cargar esta sección. Intentá de nuevo.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { data, loading, error, retry };
}
