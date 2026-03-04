// src/hook/useOrders.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  cancelOrder,
  deleteOrder,
  type OrdersQueryParams,
  type OrdersListResponse,
  type CreateOrderDTO,
  type UpdateOrderDTO,
  type UpdateStatusDTO,
} from '../services/orderService';
import { subscribeQuery } from '../../../hook/queryClient'; // عدّل المسار لو عندك مكان مختلف للـ queryClient

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * useOrders - lightweight hook for orders list (matching نفس منطق useItems)
 * Accepts optional params for filtering/pagination.
 * Returns { data, isLoading, isError, error, refetch }
 */
export const useOrders = (params?: OrdersQueryParams) => {
  const [data, setData] = useState<OrdersListResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  // stable key for deps
  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    // Abort previous (keeps parity مع useItems aunque axios ignore)
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getOrders(params);
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
    const unsub = subscribeQuery('orders', () => {
      // refetch when orders invalidated elsewhere
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

/* ----------------- helper mutation hooks (lightweight wrappers) -----------------
   These are optional convenience helpers that call the service functions and
   return the promise so components can call them and then call subscribeQuery.invalidate elsewhere.
   If you have a central mutation/invalidation system, prefer using that.
--------------------------------------------------------------------------- */

/**
 * createOrderFn(payload) => Promise
 */
export const createOrderFn = async (payload: CreateOrderDTO) => {
  return createOrder(payload);
};

/**
 * deleteOrderFn(orderId) => Promise
 */
export const deleteOrderFn = async (orderId: string) => {
  return deleteOrder(orderId);
};

/**
 * updateOrderFn({orderId, payload}) => Promise
 */
export const updateOrderFn = async (orderId: string, payload: UpdateOrderDTO) => {
  return updateOrder(orderId, payload);
};

/**
 * updateOrderStatusFn(orderId, status) => Promise
 */
export const updateOrderStatusFn = async (orderId: string, status: UpdateStatusDTO) => {
  return updateOrderStatus(orderId, status);
};

/**
 * cancelOrderFn(orderId) => Promise
 */
export const cancelOrderFn = async (orderId: string) => {
  return cancelOrder(orderId);
};

/**
 * getOrderByIdFn(orderId) => Promise<Order>
 * (useful for manual calls)
 */
export const getOrderByIdFn = async (orderId: string) => {
  return getOrderById(orderId);
};