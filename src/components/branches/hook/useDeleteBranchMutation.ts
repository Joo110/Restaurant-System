import { useState, useCallback } from 'react';
import { deleteBranch } from '../services/branchService';
import { invalidateQuery } from '../../../hook/queryClient';

type Opts = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

/**
 * useDeleteBranchMutation - returns mutate / mutateAsync and status flags
 */
export const useDeleteBranchMutation = (opts?: Opts) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const mutateAsync = useCallback(async (id: string) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      const res = await deleteBranch(id);
      // invalidate queries so list refreshes
      invalidateQuery('branches');
      // also invalidate single branch key
      invalidateQuery(`branch:${id}`);
      setIsSuccess(true);
      opts?.onSuccess?.();
      return res;
    } catch (err) {
      setError(err);
      opts?.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  const mutate = (id: string) => {
    // fire and forget (but returns promise from mutateAsync)
    return mutateAsync(id);
  };

  return {
    mutate,
    mutateAsync,
    isLoading,
    isSuccess,
    isError: !!error,
    error,
  };
};