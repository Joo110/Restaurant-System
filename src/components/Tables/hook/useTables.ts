// src/hook/useTables.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getTables,
  getTableStats,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  assignTable,
  reserveTable,
  releaseTable,
  type TablesQueryParams,
  type TablesListResponse,
  type TableStatsResponse,
  type Table,
  type CreateTableDTO,
  type UpdateTableDTO,
  type AssignTableDTO,
  type ReserveTableDTO,
} from '../services/tableService';
import { subscribeQuery } from '../../../hook/queryClient'; // عدّل المسار

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─────────────────────────── useTables ───────────────────────────

export const useTables = (params?: TablesQueryParams) => {
  const [data,      setData]      = useState<TablesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);
  const paramsKey     = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTables(params);
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
    const unsub = subscribeQuery('tables', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, paramsKey]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

// ─────────────────────────── useTableStats ───────────────────────────

export const useTableStats = (branchId?: string) => {
  const [data,      setData]      = useState<TableStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTableStats(branchId);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      setError(err);
      setData(null);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    const unsub = subscribeQuery('tables-stats', () => fetcher());
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, branchId]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

// ─────────────────────────── useTableById ───────────────────────────

export const useTableById = (id: string) => {
  const [data,      setData]      = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<unknown | null>(null);
  const mountedRef    = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const fetcher = useCallback(async () => {
    if (!id) return;
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getTableById(id);
      if (!mountedRef.current) return;
      setData(res.data ?? null);
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
    fetcher();
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, [fetcher]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

/* ─────────────────────────── Mutation helpers ─────────────────────────── */

export const createTableFn = async (payload: CreateTableDTO) =>
  createTable(payload);

export const updateTableFn = async (id: string, payload: UpdateTableDTO) =>
  updateTable(id, payload);

export const deleteTableFn = async (id: string) =>
  deleteTable(id);

export const assignTableFn = async (id: string, payload: AssignTableDTO) =>
  assignTable(id, payload);

export const reserveTableFn = async (id: string, payload: ReserveTableDTO) =>
  reserveTable(id, payload);

export const releaseTableFn = async (id: string) =>
  releaseTable(id);