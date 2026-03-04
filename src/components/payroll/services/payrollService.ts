import api from '../../../lib/axios';
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Payroll service — axios wrappers for Payroll API
 */

/** Payroll model */
export type Payroll = {
  id?: string;
  _id?: string;
  employeeId?: string;
  month?: number;
  year?: number;
  grossSalary?: number;
  deductions?: number;
  netSalary?: number;
  paymentStatus?: 'pending' | 'paid' | string;
  paymentDate?: string | null;
  branchId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export type PayrollListResponse = {
  message?: string;
  data?: Payroll[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
  [k: string]: any;
};

export type PayrollQueryParams = {
  sort?: string;
  fields?: string;
  'month[lte]'?: number;
  'month[gte]'?: number;
  year?: number | string;
  paymentStatus?: string;
  'netSalary[lte]'?: number;
  'netSalary[gte]'?: number;
  limit?: number;
  page?: number;
  branchId?: string;
  employeeId?: string;
  [k: string]: any;
};

export type ProcessPayrollDTO = {
  month: number;
  year: number;
  branchId?: string;
  [k: string]: any;
};

export type UpdatePayrollDTO = {
  paymentStatus?: string;
  paymentDate?: string | null;
  notes?: string;
  [k: string]: any;
};

/* -------------------- API calls -------------------- */

/**
 * POST /api/v1/payroll/process
 * Body: { month, year, branchId }
 * Note: endpoint returns no body (but we return res.data for consistency)
 */
export const processPayroll = async (data: ProcessPayrollDTO): Promise<any> => {
  const res = await api.post('/payroll/process', data);
  return res.data;
};

/**
 * GET /api/v1/payroll
 */
export const getPayrolls = async (params?: PayrollQueryParams): Promise<PayrollListResponse> => {
  const res = await api.get('/payroll', { params });
  return res.data;
};

/**
 * GET /api/v1/staff/payrolls/:id
 * (per spec the single-payroll endpoint lives under /staff/payrolls/:id)
 */
 
export const getPayrollById = async (id: string): Promise<Payroll> => {
  const res = await api.get(`/payroll/${id}`);
  return res.data;
};
/**
 * PATCH /api/v1/payroll/:id
 */
export const updatePayroll = async (id: string, data: UpdatePayrollDTO): Promise<any> => {
  const res = await api.patch(`/payroll/${id}`, data);
  return res.data;
};

/**
 * DELETE /api/v1/payroll/:id
 */
export const deletePayroll = async (id: string): Promise<void> => {
  await api.delete(`/payroll/${id}`);
};