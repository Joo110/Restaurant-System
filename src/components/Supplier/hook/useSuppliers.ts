// src/hook/useSuppliers.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  deleteSupplier,
  type SuppliersQueryParams,
  type SuppliersListResponse,
  type CreateSupplierDTO,
} from '../services/supplierService';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * useSuppliers - lightweight hook for suppliers list
 * Accepts optional params for filtering/pagination.
 * Returns { data, isLoading, isError, error, refetch }
 */
export const useSuppliers = (params?: SuppliersQueryParams) => {
  const [data, setData] = useState<SuppliersListResponse | null>(null);
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
      const res = await getSuppliers(params);
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
    const unsub = subscribeQuery('suppliers', () => {
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

/* ----------------- helper mutation hooks (lightweight wrappers) ----------------- */

/**
 * createSupplierFn(payload) => Promise
 */
export const createSupplierFn = async (payload: CreateSupplierDTO) => {
  return createSupplier(payload);
};

/**
 * deleteSupplierFn(supplierId) => Promise
 */
export const deleteSupplierFn = async (supplierId: string) => {
  return deleteSupplier(supplierId);
};

/**
 * getSupplierByIdFn(supplierId) => Promise<Supplier>
 */
export const getSupplierByIdFn = async (supplierId: string) => {
  return getSupplierById(supplierId);
};