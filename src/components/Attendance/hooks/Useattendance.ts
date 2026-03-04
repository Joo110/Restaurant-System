// src/hook/useAttendance.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  createAttendance,
  getAttendances,
  getAttendanceStats,
  getAttendanceById,
  updateAttendance,
  addExtraShift,
  deleteAttendance,
  type AttendanceQueryParams,
  type AttendanceStatsParams,
  type AttendanceListResponse,
  type AttendanceStatsResponse,
  type CreateAttendanceDTO,
  type UpdateAttendanceDTO,
  type ExtraShiftDTO,
  type Attendance,
} from '../services/Attendanceservice';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * useAttendances - hook for attendance list with filtering/pagination
 */
export const useAttendances = (params?: AttendanceQueryParams) => {
  const [data, setData] = useState<AttendanceListResponse | null>(null);
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
      const res = await getAttendances(params);
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
    const unsub = subscribeQuery('attendance', () => {
      fetcher();
    });
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      unsub();
    };
  }, [fetcher, paramsKey]);

  const refetch = useCallback(() => fetcher(), [fetcher]);

  return { data, isLoading, isError: !!error, error, refetch };
};

/**
 * useAttendanceStats - hook for attendance statistics
 */
export const useAttendanceStats = (params?: AttendanceStatsParams) => {
  const [data, setData] = useState<AttendanceStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);

  const paramsKey = JSON.stringify(params ?? {});

  const fetcher = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAttendanceStats(params);
      if (!mountedRef.current) return;
      setData(res);
    } catch (err) {
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
    const unsub = subscribeQuery('attendance', () => {
      fetcher();
    });
    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [fetcher, paramsKey]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

/**
 * useAttendance - hook for a single attendance record
 */
export const useAttendance = (id: string) => {
  const [data, setData] = useState<Attendance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);

  const fetcher = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAttendanceById(id);
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
    const unsub = subscribeQuery('attendance', () => {
      fetcher();
    });
    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [fetcher]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

/* ----------------- mutation helpers ----------------- */

export const createAttendanceFn = async (payload: CreateAttendanceDTO) => {
  return createAttendance(payload);
};

export const updateAttendanceFn = async (id: string, payload: UpdateAttendanceDTO) => {
  return updateAttendance(id, payload);
};

export const addExtraShiftFn = async (id: string, payload: ExtraShiftDTO) => {
  return addExtraShift(id, payload);
};

export const deleteAttendanceFn = async (id: string) => {
  return deleteAttendance(id);
};

export const getAttendanceByIdFn = async (id: string) => {
  return getAttendanceById(id);
};