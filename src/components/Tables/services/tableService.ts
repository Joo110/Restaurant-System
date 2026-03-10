// src/services/tableService.ts
import api from '../../../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─────────────────────────── Types ───────────────────────────

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'inactive';
export type TableLocation = 'indoor' | 'outdoor';

export type TableCustomer = {
  name: string;
  phone: string;
};

export type Table = {
  id: string;
  tableNumber: string;
  capacity: number;
  location: TableLocation;
  status: TableStatus;
  branch?: string;
  branchId?: string;
  currentCustomer?: TableCustomer;
  reservedAt?: string;
  reservedFor?: string;
  notes?: string;
  orderId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export type TablesListResponse = {
  message?: string;
  data?: Table[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
};

export type TableStatsResponse = {
  message?: string;
  data?: {
    total?: number;
    available?: number;
    occupied?: number;
    reserved?: number;
    inactive?: number;
    [k: string]: any;
  };
};

export type TablesQueryParams = {
  sort?: string;
  location?: TableLocation;
  status?: TableStatus;
  limit?: number;
  page?: number;
  branchId?: string;
  [k: string]: any;
};

export type CreateTableDTO = {
  tableNumber: string;
  capacity: number;
  location: TableLocation;
  branchId: string;
  notes?: string;
};

export type UpdateTableDTO = Partial<{
  capacity: number;
  location: TableLocation;
  notes: string;
  tableNumber: string;
}>;

export type AssignTableDTO = {
  customerName: string;
  customerPhone: string;
  orderId?: string;
};

export type ReserveTableDTO = {
  customerName: string;
  customerPhone: string;
  reservedFor: string; // ISO date string
};

/* ─────────────────────────── API Calls ─────────────────────────── */

/**
 * POST /api/v1/tables
 */
export const createTable = async (data: CreateTableDTO): Promise<any> => {
  const res = await api.post('/tables', data);
  return res.data;
};

/**
 * GET /api/v1/tables
 */
export const getTables = async (params?: TablesQueryParams): Promise<TablesListResponse> => {
  const res = await api.get('/tables', { params });
  return res.data;
};

/**
 * GET /api/v1/tables/stats
 */
export const getTableStats = async (branchId?: string): Promise<TableStatsResponse> => {
  const res = await api.get('/tables/stats', { params: branchId ? { branchId } : undefined });
  return res.data;
};

/**
 * GET /api/v1/tables/:id
 */
export const getTableById = async (id: string): Promise<{ message?: string; data?: Table }> => {
  const res = await api.get(`/tables/${id}`);
  return res.data;
};

/**
 * PATCH /api/v1/tables/assign/:id
 */
export const assignTable = async (id: string, data: AssignTableDTO): Promise<any> => {
  const res = await api.patch(`/tables/assign/${id}`, data);
  return res.data;
};

/**
 * PATCH /api/v1/tables/reserve/:id
 */
export const reserveTable = async (id: string, data: ReserveTableDTO): Promise<any> => {
  const res = await api.patch(`/tables/reserve/${id}`, data);
  return res.data;
};

/**
 * PATCH /api/v1/tables/release/:id
 */
export const releaseTable = async (id: string): Promise<any> => {
  const res = await api.patch(`/tables/release/${id}`);
  return res.data;
};

/**
 * PATCH /api/v1/tables/:id
 */
export const updateTable = async (id: string, data: UpdateTableDTO): Promise<any> => {
  const res = await api.patch(`/tables/${id}`, data);
  return res.data;
};

/**
 * DELETE /api/v1/tables/:id
 */
export const deleteTable = async (id: string): Promise<void> => {
  await api.delete(`/tables/${id}`);
};