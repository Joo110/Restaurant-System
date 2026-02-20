// src/components/user/services/userService.ts
import api from '../../../lib/axios';
import type { User } from '../types/user';
import type { AxiosResponse } from 'axios';

export const getMyData = (): Promise<AxiosResponse<User>> =>
  api.get('/userDashboard/getMyData');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateMyData = (payload: Partial<User>): Promise<AxiosResponse<any>> =>
  api.patch('/userDashboard/updateMyData', payload);
