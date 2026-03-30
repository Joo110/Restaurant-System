// src/hook/useAccounts.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getDashboard,
  getExecutive,
  getFinance,
  getReports,
  type DashboardResponse,
  type ExecutiveResponse,
  type FinanceResponse,
  type ReportsResponse,
  type AccountsQueryParams,
} from '../services/accountService';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─────────────────────────── Date Helpers ───────────────────────────

export type Period = 'today' | 'thisWeek' | 'thisMonth';

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export function periodToRange(period: Period, year?: number): { from: string; to: string } {
  const now = new Date();

  if (period === 'today') {
    const s = fmt(now);
    return { from: s, to: s };
  }

  if (period === 'thisWeek') {
    const day = now.getDay(); // 0=Sun
    const mon = new Date(now);
    mon.setDate(now.getDate() - ((day + 6) % 7));
    mon.setHours(0, 0, 0, 0);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return { from: fmt(mon), to: fmt(sun) };
  }

  // thisMonth — respect selected year if provided
  const y = year ?? now.getFullYear();
  const m = now.getMonth(); // 0-based, current month
  const from = new Date(y, m, 1);
  const to   = new Date(y, m + 1, 0);
  return { from: fmt(from), to: fmt(to) };
}

// ─────────────────────────── useDashboard ───────────────────────────

export const useDashboard = (params?: Pick<AccountsQueryParams, 'branchId'>) => {
  const [data, setData]       = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDashboard(params);
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
    const unsub = subscribeQuery('accounts-dashboard', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, paramsKey]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

// ─────────────────────────── useExecutive ───────────────────────────

export const useExecutive = (params?: Pick<AccountsQueryParams, 'branchId' | 'from' | 'to'>) => {
  const [data, setData]       = useState<ExecutiveResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getExecutive(params);
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
    const unsub = subscribeQuery('accounts-executive', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, paramsKey]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

// ─────────────────────────── useFinance ───────────────────────────
// Now accepts: year (for annual view) + from/to (for period filtering)
// The API only knows "year" — we pass it always.
// from/to are derived from the period and sent as extra params
// so if the backend supports them later, it just works.

export const useFinance = (params?: Pick<AccountsQueryParams, 'branchId' | 'year'> & {
  from?: string;
  to?: string;
  period?: Period;
}) => {
  const [data, setData]       = useState<FinanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setIsLoading(true);
    setError(null);
    try {
      // Always send year so the API returns the full annual dataset.
      // from/to are additional hints — the backend can use them if it supports them.
      const apiParams: any = { year: params?.year };
      if (params?.from) apiParams.from = params.from;
      if (params?.to)   apiParams.to   = params.to;
      if (params?.branchId) apiParams.branchId = params.branchId;

      const res = await getFinance(apiParams, controller.signal);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      if ((err as any)?.name === 'AbortError' || (err as any)?.code === 'ERR_CANCELED') return;
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
    const unsub = subscribeQuery('accounts-finance', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, paramsKey]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

// ─────────────────────────── useReports ───────────────────────────
// Accepts period shortcut OR explicit from/to.
// If period is given, it auto-computes from/to and passes them to the API.

export const useReports = (params?: Pick<AccountsQueryParams, 'branchId' | 'from' | 'to'> & {
  period?: Period;
}) => {
  const [data, setData]       = useState<ReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  // Resolve from/to: explicit dates win, otherwise derive from period
  const resolvedRange = (() => {
    if (params?.from && params?.to) {
      return { from: params.from, to: params.to };
    }
    if (params?.period) {
      return periodToRange(params.period);
    }
    // default: current month
    return periodToRange('thisMonth');
  })();

  const paramsKey = JSON.stringify({ ...params, ...resolvedRange });

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getReports({
        branchId: params?.branchId,
        from: resolvedRange.from,
        to:   resolvedRange.to,
      });
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
    const unsub = subscribeQuery('accounts-reports', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, paramsKey]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch: fetcher,
    resolvedRange, // expose so UI can display the active date range
  };
};