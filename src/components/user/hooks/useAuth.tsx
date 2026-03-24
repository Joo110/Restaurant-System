// src/components/user/hooks/useAuth.ts
import { useState } from 'react';
import Cookies from 'js-cookie';
import * as authService from '../services/authService';
import type { SignUpPayload, LoginPayload } from '../types/auth';

export const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const COOKIE_NAME = 'token';
  const USER_COOKIE = 'authUser';

  const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 7,
    path: '/',
    sameSite: 'lax',
  };

  const signUp = async (payload: SignUpPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.signUp(payload);
      setLoading(false);
      return res;
    } catch (e: unknown) {
      const err = e as Error;
      setError(err);
      setLoading(false);
      throw e;
    }
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const extractTokenFromResponse = (res: any): string | undefined => {
    if (!res) return undefined;
    const d = res.data ?? res;
    return (
      d?.token ??
      d?.accessToken ??
      res?.token ??
      res?.accessToken ??
      (typeof d === 'string' ? d : undefined)
    );
  };

  const getCookieOptions = (): Cookies.CookieAttributes => {
    const opts = { ...COOKIE_OPTIONS };
    if (import.meta.env && import.meta.env.PROD) {
      opts.secure = true;
    }
    return opts;
  };

  const persistToken = (token?: string) => {
    if (!token) return;
    Cookies.set(COOKIE_NAME, token, getCookieOptions());
  };

  // ✅ خزّن الـ user data (role, branchId, ...) في cookie منفصلة
  const persistUser = (res: any) => {
    const userData = res?.data?.data ?? res?.data ?? null;
    if (!userData) return;
    Cookies.set(USER_COOKIE, JSON.stringify(userData), getCookieOptions());
  };

  const clearAuth = () => {
    Cookies.remove(COOKIE_NAME, { path: '/' });
    Cookies.remove(USER_COOKIE, { path: '/' });
  };

  const logIn = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.logIn(payload);

      const token = extractTokenFromResponse(res);
      if (token) persistToken(token);

      // ✅ خزّن الـ user data عشان نقدر نقرأ الـ role والـ branchId بعدين
      persistUser(res);

      setLoading(false);
      return res;
    } catch (e: unknown) {
      const err = e as Error;
      setError(err);
      setLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      try {
        res = await authService.logout();
      } catch (e) {
        console.error('logout error:', e);
        res = null;
      }
      // ✅ امسح التوكن والـ user data مع بعض
      clearAuth();
      setLoading(false);
      return res;
    } catch (e: unknown) {
      const err = e as Error;
      setError(err);
      setLoading(false);
      throw e;
    }
  };

  const getToken = () => Cookies.get(COOKIE_NAME);

  // ✅ helper لقراءة الـ user data من الكوكيز في أي مكان
  const getUser = (): { role?: string; branchId?: string; name?: string; [key: string]: any } | null => {
    try {
      const raw = Cookies.get(USER_COOKIE);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const isAuthenticated = Boolean(getToken());

  return {
    loading,
    error,
    signUp,
    logIn,
    logout,
    getToken,
    getUser,
    isAuthenticated,
  } as const;
};

export default useAuth;