// src/hook/useBranches.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { getBranches, type BranchsQueryParams } from '../services/branchService';
import { subscribeQuery } from '../../../hook/queryClient';
import type { BranchsListResponse } from '../../user/types/branch';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * useBranches - fetch branches list, accepts optional params (filters/pagination)
 * returns { data, isLoading, isError, error, refetch }
 */
export const useBranches = (params?: BranchsQueryParams) => {
  const [data, setData] = useState<BranchsListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  // stringify params for dependency/equality
  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getBranches(params);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      setError(err);
      setData(null);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    const unsub = subscribeQuery('branches', () => {
      // refetch when branches invalidated
      fetcher();
    });
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, paramsKey]);

  const refetch = useCallback(() => fetcher(), [fetcher]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch,
  };
};