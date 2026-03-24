// src/hook/useSettlements.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  getAllSettlements,
  getSettlementStats,
  getDriverSettlements,
  getSettlementById,
  createSettlement,
  settleShift,
  updateSettlement,
  deleteSettlement,
  type SettlementsQueryParams,
  type SettlementsListResponse,
  type SettlementStatsQueryParams,
  type CreateSettlementDTO,
  type SettleShiftDTO,
  type UpdateSettlementDTO,
} from '../services/Settlementservice';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Detects axios CanceledError OR native AbortError */
function isCancelError(err: unknown): boolean {
  return (
    axios.isCancel(err) ||
    (err as any)?.name === 'CanceledError' ||
    (err as any)?.code === 'ERR_CANCELED' ||
    (err as any)?.name === 'AbortError'
  );
}

// ─── useSettlements ────────────────────────────────────────────────────────────

/**
 * useSettlements — paginated list of settlements.
 * Re-fetches when params change or 'settlements' query key is invalidated.
 */
export const useSettlements = (params?: SettlementsQueryParams) => {
  const [data,      setData]      = useState<SettlementsListResponse | null>(null);
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
      const res = await getAllSettlements(params);
      if (!mountedRef.current) return;
      setData(res);
      setError(null);
    } catch (err) {
      if (isCancelError(err)) return;
      console.error('[useSettlements] fetch error:', err);
      if (mountedRef.current) { setError(err); setData(null); }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    const unsub = subscribeQuery('settlements', () => fetcher());
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

// ─── useSettlementStats ────────────────────────────────────────────────────────

/**
 * useSettlementStats — branch-level stats for a date range.
 * Skips silently when branchId is missing.
 */
export const useSettlementStats = (params: SettlementStatsQueryParams) => {
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
      const res = await getSettlementStats(params);
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
    const unsub = subscribeQuery('settlements', () => fetcher());
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

// ─── useDriverSettlements ──────────────────────────────────────────────────────

/**
 * useDriverSettlements — settlements for a specific driver.
 */
export const useDriverSettlements = (
  driverId: string,
  params?: { limit?: number; [k: string]: any }
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
      const res = await getDriverSettlements(driverId, params);
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
    const unsub = subscribeQuery('settlements', () => fetcher());
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

/** createSettlementFn(payload) => Promise */
export const createSettlementFn = async (
  payload: CreateSettlementDTO
) => createSettlement(payload);

/** settleShiftFn(settlementId, payload?) => Promise */
export const settleShiftFn = async (
  settlementId: string,
  payload?: SettleShiftDTO
) => settleShift(settlementId, payload);

/** updateSettlementFn(settlementId, payload) => Promise */
export const updateSettlementFn = async (
  settlementId: string,
  payload: UpdateSettlementDTO
) => updateSettlement(settlementId, payload);

/** deleteSettlementFn(settlementId) => Promise */
export const deleteSettlementFn = async (
  settlementId: string
) => deleteSettlement(settlementId);

/** getSettlementByIdFn(settlementId) => Promise<Settlement> */
export const getSettlementByIdFn = async (
  settlementId: string
) => getSettlementById(settlementId);