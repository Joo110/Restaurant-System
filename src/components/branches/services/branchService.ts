// src/services/branchService.ts
import api from '../../../lib/axios';
import type { Branch, BranchsListResponse } from '../../user/types/branch'; // لو عندك التعريفات المعلّبة استخدمها، وإلا تعرّفها محلياً حسب الحاجة

/* eslint-disable @typescript-eslint/no-explicit-any */

export type BranchsQueryParams = {
  sort?: string;
  fields?: string;
  from?: string;
  to?: string;
  'branchId[lte]'?: number;
  'branchId[gte]'?: number;
  isActive?: boolean | string;
  keyword?: string;
  limit?: number;
  page?: number;
  [k: string]: any;
};

/**
 * GET /api/v1/branches
 * Expected server response shape:
 * {
 *   message: string,
 *   stats: { total: number, active: number, inactive: number },
 *   data: Branch[],
 *   results: number,
 *   paginationResult: { currentPage, limit, totalDocs, totalPages }
 * }
 */
export const getBranches = async (params?: BranchsQueryParams): Promise<BranchsListResponse> => {
  const res = await api.get('/branches', { params });
  // res.data هو الجسم الكامل كما أرفقت في المثال
  return res.data;
};

export const getBranchById = async (id: string): Promise<Branch> => {
  const res = await api.get(`/branches/${id}`);
  return res.data;
};

export type UpdateBranchDTO = Partial<{
  name: string;
  phone: string;
  isActive: boolean;
  // ضيف الحقول الممكن تتحدثها
}>;

export const updateBranch = async (id: string, data: UpdateBranchDTO): Promise<any> => {
  const res = await api.patch(`/branches/${id}`, data);
  return res.data;
};

export const deleteBranch = async (id: string): Promise<void> => {
  await api.delete(`/branches/${id}`);
};

/**
 * Create Branch
 * POST /api/v1/branches
 * body example:
 * {
 *   name,
 *   address: { street, city, country },
 *   phone,
 *   email,
 *   notes
 * }
 */
export type CreateBranchDTO = {
  name: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  notes?: string;
  [k: string]: any;
};

export const createBranch = async (data: CreateBranchDTO): Promise<any> => {
  const res = await api.post('/branches', data);
  return res.data;
};