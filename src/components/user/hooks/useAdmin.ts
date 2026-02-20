// src/components/user/hooks/useAdmin.ts
import { useState } from 'react';
import * as adminService from '../services/adminService';
import type { PaginatedResponse, User } from '../types/user';
import type { AxiosResponse } from 'axios';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const useAdminDashboard = () => {   // <-- اسم مُعدَّل هنا
  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const res: AxiosResponse<any> = await adminService.getAllUsers(params);
      const payload: PaginatedResponse<User> = {
        data: res.data?.data ?? res.data ?? [],
        results: res.data?.results,
        page: res.data?.page,
        limit: res.data?.limit,
        total: res.data?.total,
        status: res.data?.status,
      };
      setData(payload);
      setLoading(false);
      return res;
    } catch (e: unknown) {
      setError(e as Error);
      setLoading(false);
      throw e;
    }
  };

  const create = (payload: Parameters<typeof adminService.createUser>[0]) =>
    adminService.createUser(payload);

  const updateRole = (id: string, role: string) => adminService.updateUserRole(id, role);

  const deactivate = (id: string) => adminService.deactivateUser(id);
  const activate = (id: string) => adminService.activateUser(id);

  return { data, loading, error, fetch, create, updateRole, deactivate, activate } as const;
};
