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
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const useOrders = (params?: OrdersQueryParams) => {
  const [data, setData] = useState<OrdersListResponse | null>(null);
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

export const createOrderFn = async (payload: CreateOrderDTO) => {
  return createOrder(payload);
};

export const deleteOrderFn = async (orderId: string) => {
  return deleteOrder(orderId);
};

export const updateOrderFn = async (orderId: string, payload: UpdateOrderDTO) => {
  return updateOrder(orderId, payload);
};

export const updateOrderStatusFn = async (orderId: string, status: UpdateStatusDTO) => {
  return updateOrderStatus(orderId, status);
};

export const cancelOrderFn = async (orderId: string) => {
  return cancelOrder(orderId);
};

export const getOrderByIdFn = async (orderId: string) => {
  return getOrderById(orderId);
};