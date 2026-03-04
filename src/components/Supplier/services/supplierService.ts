// src/services/supplierService.ts
import api from '../../../lib/axios';
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Supplier service — thin axios wrappers for the Suppliers API
 */

export type BankInfo = {
  name?: string;
  accountNumber?: string;
  [k: string]: any;
};

export type Supplier = {
  id?: string;
  _id?: string;
  companyName: string;
  mainContact?: string;
  email?: string;
  supportPhone?: string;
  website?: string;
  officeAddress?: string;
  categories?: string;
  bank?: BankInfo;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export type SuppliersListResponse = {
  message?: string;
  data?: Supplier[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
  [k: string]: any;
};

export type SuppliersQueryParams = {
  sort?: string;
  keyword?: string;
  limit?: number;
  page?: number;
  [k: string]: any;
};

export type CreateSupplierDTO = {
  companyName: string;
  mainContact?: string;
  email?: string;
  supportPhone?: string;
  website?: string;
  officeAddress?: string;
  categories?: string;
  bank?: BankInfo;
  [k: string]: any;
};

/* -------------------- API calls -------------------- */

/**
 * POST /api/v1/suppliers
 */
export const createSupplier = async (data: CreateSupplierDTO): Promise<any> => {
  const res = await api.post('/suppliers', data);
  return res.data;
};

/**
 * GET /api/v1/suppliers
 */
export const getSuppliers = async (params?: SuppliersQueryParams): Promise<SuppliersListResponse> => {
  const res = await api.get('/suppliers', { params });
  return res.data;
};

/**
 * GET /api/v1/suppliers/:id
 */
export const getSupplierById = async (id: string): Promise<Supplier> => {
  const res = await api.get(`/suppliers/${id}`);
  return res.data;
};

/**
 * DELETE /api/v1/suppliers/:id
 */
export const deleteSupplier = async (id: string): Promise<void> => {
  await api.delete(`/suppliers/${id}`);
};