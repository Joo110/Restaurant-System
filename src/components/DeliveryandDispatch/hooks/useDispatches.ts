// src/hook/useDispatches.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  getAllDispatches,
  getActiveDispatches,
  getRecentActivity,
  getDriverDispatches,
  getDispatchById,
  createDispatch,
  updateDispatchStatus,
  markDispatchFailed,
  type DispatchesQueryParams,
  type DispatchesListResponse,
  type ActiveDispatchesQueryParams,
  type RecentActivityQueryParams,
  type DriverDispatchesQueryParams,
  type UpdateDispatchStatusDTO,
  type MarkDispatchFailedDTO,
} from '../services/dispatchService';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Detects axios CanceledError OR native AbortError.
 * Axios does NOT throw a native AbortError — it throws CanceledError
 * with code "ERR_CANCELED". The old check (err.name === 'AbortError')
 * never matched axios cancellations, so isLoading stayed true forever.
 */
function isCancelError(err: unknown): boolean {
  return (
    axios.isCancel(err) ||
    (err as any)?.name === 'CanceledError' ||
    (err as any)?.code === 'ERR_CANCELED' ||
    (err as any)?.name === 'AbortError'
  );
}

// ─── useDispatches ─────────────────────────────────────────────────────────────

export const useDispatches = (params?: DispatchesQueryParams) => {
  const [data,      setData]      = useState<DispatchesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error,     setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    if (mountedRef.current) { setIsLoading(true); setError(null); }

    try {
      const res = await getAllDispatches(params);
      if (!mountedRef.current) return;
      setData(res);
      setError(null);
    } catch (err) {
      if (isCancelError(err)) return;
      console.error('[useDispatches] fetch error:', err);
      if (mountedRef.current) { setError(err); setData(null); }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    const unsub = subscribeQuery('dispatches', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: useCallback(() => fetcher(), [fetcher]),
  };
};

// ─── useActiveDispatches ───────────────────────────────────────────────────────

export const useActiveDispatches = (params: ActiveDispatchesQueryParams) => {
  const [data,      setData]      = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error,     setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const isValidBranchId =
    typeof params.branchId === 'string' && params.branchId.trim().length > 0;
  const paramsKey = JSON.stringify(params);

  const fetcher = useCallback(async () => {
    if (!isValidBranchId) {
      if (mountedRef.current) { setData(null); setIsLoading(false); }
      return;
    }
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    if (mountedRef.current) { setIsLoading(true); setError(null); }
    try {
      const res = await getActiveDispatches(params);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      if (isCancelError(err)) return;
      if (mountedRef.current) { setData(null); setError(err); }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, isValidBranchId]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    const unsub = subscribeQuery('dispatches', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: useCallback(() => fetcher(), [fetcher]),
  };
};

// ─── useRecentActivity ─────────────────────────────────────────────────────────

export const useRecentActivity = (params: RecentActivityQueryParams) => {
  const [data,      setData]      = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error,     setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const isValidBranchId =
    typeof params.branchId === 'string' && params.branchId.trim().length > 0;
  const paramsKey = JSON.stringify(params);

  const fetcher = useCallback(async () => {
    if (!isValidBranchId) {
      if (mountedRef.current) { setData(null); setIsLoading(false); }
      return;
    }
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    if (mountedRef.current) { setIsLoading(true); setError(null); }
    try {
      const res = await getRecentActivity(params);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      if (isCancelError(err)) return;
      if (mountedRef.current) { setData(null); setError(err); }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, isValidBranchId]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    const unsub = subscribeQuery('dispatches', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: useCallback(() => fetcher(), [fetcher]),
  };
};

// ─── useDriverDispatches ───────────────────────────────────────────────────────

export const useDriverDispatches = (
  driverId: string,
  params?: DriverDispatchesQueryParams
) => {
  const [data,      setData]      = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error,     setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const paramsKey = JSON.stringify({ driverId, ...(params ?? {}) });

  const fetcher = useCallback(async () => {
    if (!driverId) return;
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    if (mountedRef.current) { setIsLoading(true); setError(null); }
    try {
      const res = await getDriverDispatches(driverId, params);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      if (isCancelError(err)) return;
      if (mountedRef.current) { setError(err); setData(null); }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    const unsub = subscribeQuery('dispatches', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: useCallback(() => fetcher(), [fetcher]),
  };
};

// ─── Mutation helpers ──────────────────────────────────────────────────────────

export const createDispatchFn = async (
  payload: import('../services/dispatchService').CreateDispatchDTO
) => createDispatch(payload);

export const updateDispatchStatusFn = async (
  dispatchId: string,
  payload: UpdateDispatchStatusDTO
) => updateDispatchStatus(dispatchId, payload);

export const markDispatchFailedFn = async (
  dispatchId: string,
  payload: MarkDispatchFailedDTO
) => markDispatchFailed(dispatchId, payload);

export const getDispatchByIdFn = async (dispatchId: string) =>
  getDispatchById(dispatchId);