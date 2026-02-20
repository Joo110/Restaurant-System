// src/components/user/services/passwordService.ts
import api from '../../../lib/axios';
import type { AxiosResponse } from 'axios';
    /* eslint-disable @typescript-eslint/no-explicit-any */

export const sendResetCode = (email: string): Promise<AxiosResponse<any>> =>
  api.post('/forgetPassword/sendResetCode', { email });

export const resendResetCode = (email: string): Promise<AxiosResponse<any>> =>
  api.post('/forgetPassword/resendResetCode', { email });
