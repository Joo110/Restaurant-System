// src/services/inventoryService.ts
import api from '../../../lib/axios';
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Inventory service — thin axios wrappers for the Inventory API
 */

export type InventoryItem = {
  id?: string;
  _id?: string;
  itemId: string;
  unit?: string;
  currentQuantity?: number;
  targetQuantity?: number;
  supplier?: string;
  lastPrice?: number;
  branchId?: string;
  expiryDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export type InventoryListResponse = {
  message?: string;
  data?: InventoryItem[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
  [k: string]: any;
};

export type InventoryQueryParams = {
  sort?: string;
  keyword?: string;
  limit?: number;
  page?: number;
  branchId?: string;
  [k: string]: any;
};

export type CreateInventoryDTO = {
  itemId: string;
  unit?: string;
  currentQuantity?: number;
  targetQuantity?: number;
  supplier?: string;
  lastPrice?: number;
  branchId?: string;
  expiryDate?: string | null;
  [k: string]: any;
};

export type UpdateInventoryDTO = Partial<{
  unit: string;
  currentQuantity: number;
  targetQuantity: number;
  supplier: string;
  lastPrice: number;
  expiryDate: string | null;
  [k: string]: any;
}>;

export type RestockDTO = {
  quantity: number;
  supplier?: string;
  price?: number;
  expiryDate?: string | null;
  [k: string]: any;
};

export type InventoryStatsResponse = {
  totalItems?: number;
  lowStockCount?: number;
  nearExpiryCount?: number;
  byBranch?: Record<string, any>;
  [k: string]: any;
};

/* -------------------- API calls -------------------- */

/**
 * GET /api/v1/inventory/stats?branchId=...
 */
export const getInventoryStats = async (branchId?: string): Promise<InventoryStatsResponse> => {
  const res = await api.get('/inventory/stats', { params: { branchId } });
  return res.data;
};

/**
 * GET /api/v1/inventory
 */
export const getInventory = async (params?: InventoryQueryParams): Promise<InventoryListResponse> => {
  const res = await api.get('/inventory', { params });
  return res.data;
};

/**
 * GET /api/v1/inventory/:id
 */
export const getInventoryById = async (id: string): Promise<InventoryItem> => {
  const res = await api.get(`/inventory/${id}`);
  return res.data;
};

/**
 * POST /api/v1/inventory
 */
export const createInventory = async (data: CreateInventoryDTO): Promise<any> => {
  const res = await api.post('/inventory', data);
  return res.data;
};

/**
 * PATCH /api/v1/inventory/:id
 */
export const updateInventory = async (id: string, data: UpdateInventoryDTO): Promise<any> => {
  const res = await api.patch(`/inventory/${id}`, data);
  return res.data;
};

/**
 * PATCH /api/v1/inventory/restock/:id
 */
export const restockInventory = async (id: string, payload: RestockDTO): Promise<any> => {
  const res = await api.patch(`/inventory/restock/${id}`, payload);
  return res.data;
};

/**
 * DELETE /api/v1/inventory/:id
 */
export const deleteInventory = async (id: string): Promise<void> => {
  await api.delete(`/inventory/${id}`);
};