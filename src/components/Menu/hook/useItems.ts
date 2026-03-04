// src/hook/useItems.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { getItems, type ItemsQueryParams, type ItemsListResponse } from '../services/itemService';
import { subscribeQuery } from '../../../hook/queryClient'; // عدّل المسار لو عندك مكان مختلف للـ queryClient

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * useItems - fetch items list, accepts optional params (filters/pagination)
 * returns { data, isLoading, isError, error, refetch }
 */
export const useItems = (params?: ItemsQueryParams) => {
  const [data, setData] = useState<ItemsListResponse | null>(null);
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
      const res = await getItems(params);
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
    const unsub = subscribeQuery('items', () => {
      // refetch when items invalidated
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