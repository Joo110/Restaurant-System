import { useEffect, useState, useCallback, useRef } from 'react';
import { getBranchById } from '../services/branchService';
import { subscribeQuery } from '../../../hook/queryClient';

/**
 * useBranch - fetch single branch by id
 * returns { data, isLoading, isError, error, refetch }
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const useBranch = (id?: string) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const fetcher = useCallback(async (forceId?: string) => {
    const bid = forceId ?? id;
    if (!bid) return;
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBranchById(bid);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      setError(err);
      setData(null);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    mountedRef.current = true;
    if (id) fetcher(id);
    const unsub = subscribeQuery('branch:' + id, () => {
      // refetch when invalidated
      if (id) fetcher(id);
    });
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const refetch = useCallback(() => {
    if (id) return fetcher(id);
    return Promise.resolve();
  }, [id, fetcher]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch,
  };
};