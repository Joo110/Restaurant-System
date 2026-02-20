// src/components/user/hooks/useAuth.ts
import { useState } from 'react';
import Cookies from 'js-cookie';
import * as authService from '../services/authService';
import type { SignUpPayload, LoginPayload } from '../types/auth';

/**
 * useAuth hook (lightweight, no provider)
 * - يقوم بتشغيل authService (افتراضياً يقوم هو بالاتصال بالـ API)
 * - يخزن التوكن في كوكيز بعد نجاح تسجيل الدخول
 * - يزيل التوكن عند تسجيل الخروج
 *
 * ملاحظة: تأكد أن استجابة authService.logIn تُعيد توكن في أحد الحقول:
 * - res.data.token
 * - res.data.accessToken
 * - res.token
 * - res.accessToken
 */
export const useAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const COOKIE_NAME = 'token';
  const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 7, // أيام
    path: '/',
    sameSite: 'lax',
    // secure: true عند الانتاج (ننشئه ديناميكياً عند الحاجة)
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

  const extractTokenFromResponse = (res: any): string | undefined => {
    // حاول عدة مسارات محتملة للاستجابة
    if (!res) return undefined;
    // axios عادةً يضع في res.data
    const d = res.data ?? res;
    return (
      d?.token ??
      d?.accessToken ??
      res?.token ??
      res?.accessToken ??
      (typeof d === 'string' ? d : undefined)
    );
  };

  const persistToken = (token?: string) => {
    if (!token) return;
    const opts = { ...COOKIE_OPTIONS } as Cookies.CookieAttributes;
    // فعّل secure في بيئة production
    if (import.meta.env && import.meta.env.PROD) {
      opts.secure = true;
    }
    Cookies.set(COOKIE_NAME, token, opts);
  };

  const clearToken = () => {
    Cookies.remove(COOKIE_NAME, { path: '/' });
  };

  const logIn = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.logIn(payload);
      // محاولة استخراج التوكن
      const token = extractTokenFromResponse(res);
      if (token) {
        persistToken(token);
      } else {
        // لا توكن؟ نتركه لكن نحذّر في الكونسول (لا يرمي خطأ لأن التطبيقات قد تعتمد على سلوك مختلف)
        // console.warn('login: no token found in response', res);
      }
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
      // محاولة استدعاء خدمة الخروج على السيرفر (إن وُجد)
      let res;
      try {
        res = await authService.logout();
      } catch (e) {
        console.error('logout error:', e);
        res = null;
      }
      clearToken();
      setLoading(false);
      return res;
    } catch (e: unknown) {
      const err = e as Error;
      setError(err);
      setLoading(false);
      throw e;
    }
  };

  const getToken = () => {
    return Cookies.get(COOKIE_NAME);
  };

  const isAuthenticated = Boolean(getToken());

  return {
    loading,
    error,
    signUp,
    logIn,
    logout,
    getToken,
    isAuthenticated,
  } as const;
};

export default useAuth;
