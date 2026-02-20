// src/components/user/hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';
import * as userService from '../services/userService';
import type { User } from '../types/user';

export const useMyData = () => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // fetch function exposed for manual refresh
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getMyData();
      setData(res.data);
      setLoading(false);
      return res;
    } catch (e: unknown) {
      setError(e as Error);
      setLoading(false);
      throw e;
    }
  }, []);

  const update = async (payload: Parameters<typeof userService.updateMyData>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.updateMyData(payload);
      // refresh after update
      await fetch();
      setLoading(false);
      return res;
    } catch (e: unknown) {
      setError(e as Error);
      setLoading(false);
      throw e;
    }
  };

  // initial load — useCallback + effect to avoid lint complaining
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await userService.getMyData();
        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        // set error only if mounted
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty; fetch() is safe because we used a direct call here

  return { data, loading, error, fetch, update } as const;
};
