// src/hook/useDrivers.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  createDriver,
  getAllDrivers,
  getDriverStats,
  getDriverById,
  updateDriverStatus,
  updateDriver,
  deleteDriver,
  type DriversQueryParams,
  type DriversListResponse,
  type DriverStatsQueryParams,
  type CreateDriverDTO,
  type UpdateDriverDTO,
  type UpdateDriverStatusDTO,
} from '../services/driverService';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── useDrivers ────────────────────────────────────────────────────────────────

/**
 * useDrivers — fetches paginated/filtered drivers list.
 * Re-fetches when params change or 'drivers' query key is invalidated.
 */
export const useDrivers = (params?: DriversQueryParams) => {
  const [data, setData] = useState<DriversListResponse | null>(null);
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
      const res = await getAllDrivers(params);
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
    const unsub = subscribeQuery('drivers', () => fetcher());
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
    refetch: useCallback(() => fetcher(), [fetcher]),
  };
};

// ─── useDriverStats ────────────────────────────────────────────────────────────

/**
 * useDriverStats — fetches driver statistics for a specific branch.
 */
export const useDriverStats = (params: DriverStatsQueryParams) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const paramsKey = JSON.stringify(params);

  const fetcher = useCallback(async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getDriverStats(params);
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
    const unsub = subscribeQuery('drivers', () => fetcher());
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
    refetch: useCallback(() => fetcher(), [fetcher]),
  };
};

// ─── Mutation helpers ──────────────────────────────────────────────────────────

/** createDriverFn(payload) => Promise */
export const createDriverFn = async (payload: CreateDriverDTO) =>
  createDriver(payload);

/** deleteDriverFn(driverId) => Promise */
export const deleteDriverFn = async (driverId: string) =>
  deleteDriver(driverId);

/** updateDriverFn(driverId, payload) => Promise */
export const updateDriverFn = async (driverId: string, payload: UpdateDriverDTO) =>
  updateDriver(driverId, payload);

/** updateDriverStatusFn(driverId, payload) => Promise */
export const updateDriverStatusFn = async (
  driverId: string,
  payload: UpdateDriverStatusDTO
) => updateDriverStatus(driverId, payload);

/** getDriverByIdFn(driverId) => Promise<Driver> */
export const getDriverByIdFn = async (driverId: string) =>
  getDriverById(driverId);