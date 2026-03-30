// src/hook/useEmployees.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  type EmployeesQueryParams,
  type EmployeesListResponse,
  type CreateEmployeeDTO,
  type UpdateEmployeeDTO,
  type Employee,
} from '../services/employeeService';
import { subscribeQuery } from '../../../hook/queryClient';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const useEmployees = (params?: EmployeesQueryParams) => {
  const [data, setData] = useState<EmployeesListResponse | null>(null);
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
      const res = await getEmployees(params);
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

    const unsub = subscribeQuery('employees', () => {
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

export const useEmployee = (id: string) => {
  const [data, setData] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<unknown | null>(null);
  const mountedRef = useRef(true);

  const fetcher = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await getEmployeeById(id);
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

    const unsub = subscribeQuery('employees', () => {
      fetcher();
    });

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, [fetcher]);

  return { data, isLoading, isError: !!error, error, refetch: fetcher };
};

export const createEmployeeFn = async (payload: CreateEmployeeDTO) => {
  return createEmployee(payload);
};

export const updateEmployeeFn = async (id: string, payload: UpdateEmployeeDTO) => {
  return updateEmployee(id, payload);
};

export const deleteEmployeeFn = async (id: string) => {
  return deleteEmployee(id);
};

export const getEmployeeByIdFn = async (id: string) => {
  return getEmployeeById(id);
};