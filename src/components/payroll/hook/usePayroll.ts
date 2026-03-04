import { useEffect, useState, useCallback, useRef } from 'react';
import {
  processPayroll,
  getPayrolls,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  type Payroll,
  type PayrollQueryParams,
  type PayrollListResponse,
  type ProcessPayrollDTO,
  type UpdatePayrollDTO,
} from '../services/payrollService';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * usePayrolls - hook for payroll list with filtering/pagination
 */
export const usePayrolls = (params?: PayrollQueryParams) => {
  const [data, setData] = useState<PayrollListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      const res = await getPayrolls(params);
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
    const unsub = subscribeQuery('payroll', () => {
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

/**
 * usePayroll - hook for a single payroll record
 */
export const usePayroll = (id?: string) => {
  const [data, setData] = useState<Payroll | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);

  const fetcher = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPayrollById(id);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    mountedRef.current = true;
    fetcher();
    const unsub = subscribeQuery(`payroll:${id}`, () => {
      fetcher();
    });
    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [fetcher, id]);

  const refetch = useCallback(() => fetcher(), [fetcher]);

  return { data, isLoading, isError: !!error, error, refetch };
};

/* ----------------- mutation helpers ----------------- */

/**
 * processPayrollFn(payload) => Promise
 * Calls POST /payroll/process
 */
export const processPayrollFn = async (payload: ProcessPayrollDTO) => {
  return processPayroll(payload);
};

/**
 * updatePayrollFn(id, payload) => Promise
 * Calls PATCH /payroll/:id
 */
export const updatePayrollFn = async (id: string, payload: UpdatePayrollDTO) => {
  return updatePayroll(id, payload);
};

/**
 * deletePayrollFn(id) => Promise
 * Calls DELETE /payroll/:id
 */
export const deletePayrollFn = async (id: string) => {
  return deletePayroll(id);
};

/**
 * getPayrollByIdFn(id) => Promise<Payroll>
 */
export const getPayrollByIdFn = async (id: string) => {
  return getPayrollById(id);
};