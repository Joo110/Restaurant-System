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

// ─────────────────────────── useDashboard ───────────────────────────

export const useDashboard = (params?: Pick<AccountsQueryParams, 'branchId'>) => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);
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
  const [data, setData] = useState<ExecutiveResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);
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

export const useFinance = (params?: Pick<AccountsQueryParams, "branchId" | "year">) => {
  const [data, setData] = useState<FinanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const res = await getFinance(params, controller.signal);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      if ((err as any)?.name === "AbortError" || (err as any)?.code === "ERR_CANCELED") return;
      setError(err);
      setData(null);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();

    const unsub = subscribeQuery("accounts-finance", () => fetcher());

    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, paramsKey]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

// ─────────────────────────── useReports ───────────────────────────

export const useReports = (params?: Pick<AccountsQueryParams, 'branchId' | 'from' | 'to'>) => {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getReports(params);
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

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};