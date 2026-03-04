// src/services/itemService.ts
import api from '../../../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Item = {
  id?: string;
  _id?: string;
  name?: string;
  description?: string;
  price?: number | string;
  isAvailable?: boolean;
  image?: string | null;
  category?: string;
  itemId?: number;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export type ItemsListResponse = {
  message?: string;
  data?: Item[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
  [k: string]: any;
};

export type ItemsQueryParams = {
  sort?: string;
  fields?: string;
  from?: string;
  to?: string;
  'itemId[lte]'?: number;
  'itemId[gte]'?: number;
  isActive?: boolean | string;
  keyword?: string;
  limit?: number;
  page?: number;
  [k: string]: any;
};

export type CreateItemDTO = {
  name: string;
  description: string;
  price: number | string;
  category: string;
  isAvailable: boolean | string;
  branchId: string;
  image?: File | null;
  [k: string]: any;
};

/**
 * POST /api/v1/items
 * Sends multipart/form-data — do NOT set Content-Type manually.
 * axios sets it automatically with the correct boundary.
 */
export const createItem = async (data: CreateItemDTO): Promise<any> => {
  const fd = new FormData();
  fd.append('name', String(data.name));
  fd.append('description', String(data.description));
  fd.append('price', String(data.price));
  fd.append('category', String(data.category));
  fd.append('isAvailable', String(data.isAvailable));
  fd.append('branchId', String(data.branchId));
  if (data.image instanceof File) {
    fd.append('image', data.image);
  }

  const res = await api.post('/items', fd);
  return res.data;
};

/**
 * GET /api/v1/items
 */
export const getItems = async (params?: ItemsQueryParams): Promise<ItemsListResponse> => {
  const res = await api.get('/items', { params });
  return res.data;
};

/**
 * GET /api/v1/items/:id
 */
export const getItemById = async (id: string): Promise<Item> => {
  const res = await api.get(`/items/${id}`);
  return res.data;
};

export type UpdateItemDTO = Partial<{
  name: string;
  description: string;
  price: number | string;
  isAvailable: boolean | string;
  image?: File | null;
  [k: string]: any;
}>;

/**
 * PATCH /api/v1/items/:id
 * Sends multipart/form-data.
 */
export const updateItem = async (id: string, data: UpdateItemDTO): Promise<any> => {
  const fd = new FormData();
  if (data.name !== undefined) fd.append('name', String(data.name));
  if (data.description !== undefined) fd.append('description', String(data.description));
  if (data.price !== undefined) fd.append('price', String(data.price));
  if (data.isAvailable !== undefined) fd.append('isAvailable', String(data.isAvailable));
  if (data.image instanceof File) fd.append('image', data.image);

  const res = await api.patch(`/items/${id}`, fd);
  return res.data;
};

/**
 * DELETE /api/v1/items/:id
 */
export const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/items/${id}`);
};