// src/hook/useInventory.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  restockInventory,
  deleteInventory,
  getInventoryStats,
  type InventoryQueryParams,
  type InventoryListResponse,
  type InventoryItem,
  type CreateInventoryDTO,
  type UpdateInventoryDTO,
  type RestockDTO,
} from '../services/inventoryService';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * useInventory - lightweight hook for inventory list (per branch or global)
 */
export const useInventory = (params?: InventoryQueryParams) => {
  const [data, setData] = useState<InventoryListResponse | null>(null);
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
      const res = await getInventory(params);
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
    const unsub = subscribeQuery('inventory', () => {
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
 * useInventoryItem - fetch single inventory item by id (lightweight)
 */
export const useInventoryItem = (id?: string) => {
  const [data, setData] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);

  const fetcher = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getInventoryById(id);
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
    const unsub = subscribeQuery(`inventory:${id}`, () => {
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

/* ----------------- helper mutation wrappers ----------------- */

/**
 * createInventoryFn(payload) => Promise
 */
export const createInventoryFn = async (payload: CreateInventoryDTO) => {
  return createInventory(payload);
};

/**
 * updateInventoryFn(itemId, payload) => Promise
 */
export const updateInventoryFn = async (itemId: string, payload: UpdateInventoryDTO) => {
  return updateInventory(itemId, payload);
};

/**
 * restockInventoryFn(itemId, payload) => Promise
 */
export const restockInventoryFn = async (itemId: string, payload: RestockDTO) => {
  return restockInventory(itemId, payload);
};

/**
 * deleteInventoryFn(itemId) => Promise
 */
export const deleteInventoryFn = async (itemId: string) => {
  return deleteInventory(itemId);
};

/**
 * getInventoryByIdFn(itemId) => Promise<InventoryItem>
 */
export const getInventoryByIdFn = async (itemId: string) => {
  return getInventoryById(itemId);
};

/**
 * getInventoryStatsFn(branchId?) => Promise<InventoryStatsResponse>
 */
export const getInventoryStatsFn = async (branchId?: string) => {
  return getInventoryStats(branchId);
};