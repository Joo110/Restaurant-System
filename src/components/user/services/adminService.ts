// src/components/user/services/adminService.ts
import api from '../../../lib/axios';
import type { User, GetUsersParams } from '../types/user';
import type { AxiosResponse } from 'axios';

    /* eslint-disable @typescript-eslint/no-explicit-any */
export const createUser = (
  payload: User & { password: string; passwordConfirmation: string }
): Promise<AxiosResponse<any>> => api.post('/adminDashboard', payload);

/** get all users (paginated) */
export const getAllUsers = (params?: GetUsersParams): Promise<AxiosResponse<any>> =>
  api.get('/adminDashboard', { params });

export const updateUserRole = (id: string, role: string): Promise<AxiosResponse<any>> =>
  api.patch(`/adminDashboard/${id}`, { role });

export const deactivateUser = (id: string): Promise<AxiosResponse<any>> =>
  api.patch(`/adminDashboard/deactivate/${id}`);

export const activateUser = (id: string): Promise<AxiosResponse<any>> =>
  api.patch(`/adminDashboard/activate/${id}`);
