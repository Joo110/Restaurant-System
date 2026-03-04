import { useState, useCallback } from 'react';
import { updateBranch } from '../services/branchService';
import type { UpdateBranchDTO } from '../services/branchService';
import { invalidateQuery } from '../../../hook/queryClient';

type Opts = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

/**
 * useUpdateBranchMutation - update branch and invalidate related queries
 */
export const useUpdateBranchMutation = (opts?: Opts) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const mutateAsync = useCallback(async ({ id, data }: { id: string; data: UpdateBranchDTO }) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      const res = await updateBranch(id, data);
      // invalidate list + single item
      invalidateQuery('branches');
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

  const mutate = (vars: { id: string; data: UpdateBranchDTO }) => mutateAsync(vars);

  return {
    mutate,
    mutateAsync,
    isLoading,
    isSuccess,
    isError: !!error,
    error,
  };
};