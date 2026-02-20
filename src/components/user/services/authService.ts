// src/components/user/services/authService.ts
import api from '../../../lib/axios';
import type { SignUpPayload, LoginPayload } from '../types/auth';
import type { AxiosResponse } from 'axios';
    /* eslint-disable @typescript-eslint/no-explicit-any */

export const signUp = (payload: SignUpPayload): Promise<AxiosResponse<any>> => {
  return api.post('/auth/signUp', payload);
};

export const logIn = async (payload: LoginPayload): Promise<AxiosResponse<any>> => {
  const res = await api.post('/auth/logIn', payload);
  // Adjust according to real response shape. Example: res.data = { token: '...' }
  if (res.data?.token) {
    localStorage.setItem('token', res.data.token);
  }
  return res;
};

export const logout = (): Promise<AxiosResponse<any>> => {
  return api.post('/auth/logout').then((res) => {
    localStorage.removeItem('token');
    return res;
  });
};
