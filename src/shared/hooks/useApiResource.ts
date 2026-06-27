/**
 * MR-B — Small async-resource hook for read-only backend fetches.
 *
 * Wraps a function returning an ApiResult<T> into the canonical screen states:
 *   loading | ready(data) | empty(ready+caller decides) | error(ApiError).
 *
 * It NEVER fabricates data: on failure it exposes the typed ApiError so screens
 * can render the right state (session-expired on AUTH_EXPIRED, backend-
 * unavailable on BACKEND_UNAVAILABLE, backend-gap on NOT_FOUND, etc.). The
 * empty state is the caller's concern (it inspects `data`).
 */

import {useCallback, useEffect, useState} from 'react';
import {ApiError, ApiResult} from '../../backend/types';

export type ResourceStatus = 'loading' | 'ready' | 'error';

export interface ApiResourceState<T> {
  status: ResourceStatus;
  data?: T;
  error?: ApiError;
  /** Re-run the fetch. */
  reload: () => void;
}

export function useApiResource<T>(
  fetcher: () => Promise<ApiResult<T>>,
  deps: ReadonlyArray<unknown> = [],
): ApiResourceState<T> {
  const [status, setStatus] = useState<ResourceStatus>('loading');
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | undefined>(undefined);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(undefined);

    void (async () => {
      const result = await fetcher();
      if (cancelled) {
        return;
      }
      if (result.ok) {
        setData(result.data);
        setStatus('ready');
      } else {
        setError(result.error);
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return {status, data, error, reload};
}
