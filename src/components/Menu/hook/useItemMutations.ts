// src/hook/useItemMutations.ts
import { useState, useCallback } from 'react';
import { createItem, updateItem, deleteItem } from '../services/itemService';
import { invalidateQuery } from '../../../hook/queryClient'; // عدّل المسار لو عندك مكان مختلف للـ queryClient

type Opts = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * useCreateItemMutation
 */
export const useCreateItemMutation = (opts?: Opts) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const mutateAsync = useCallback(async (data: any) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      const res = await createItem(data);

      // نعمل refresh للـ items list
      invalidateQuery('items');

      setIsSuccess(true);
      opts?.onSuccess?.();
      return res;
    } catch (err) {
      setError(err);
      opts?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  const mutate = (data: any) => mutateAsync(data);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isSuccess,
    isError: !!error,
    error,
  };
};

/**
 * useUpdateItemMutation
 */
export const useUpdateItemMutation = (opts?: Opts) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const mutateAsync = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      const res = await updateItem(id, data);
      // invalidate queries so list/details refresh
      invalidateQuery('items');
      invalidateQuery(`item:${id}`);
      setIsSuccess(true);
      opts?.onSuccess?.();
      return res;
    } catch (err) {
      setError(err);
      opts?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  const mutate = (id: string, data: any) => mutateAsync(id, data);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isSuccess,
    isError: !!error,
    error,
  };
};

/**
 * useDeleteItemMutation
 */
export const useDeleteItemMutation = (opts?: Opts) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const mutateAsync = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      const res = await deleteItem(id);
      // invalidate queries so list/details refresh
      invalidateQuery('items');
      invalidateQuery(`item:${id}`);
      setIsSuccess(true);
      opts?.onSuccess?.();
      return res;
    } catch (err) {
      setError(err);
      opts?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  const mutate = (id: string) => mutateAsync(id);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isSuccess,
    isError: !!error,
    error,
  };
};