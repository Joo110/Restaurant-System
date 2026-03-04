// src/types/branch.ts
export type Branch = {
  id: string;
  branchId?: number;
  name?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BranchsListResponse = {
  data: Branch[]; 
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
};