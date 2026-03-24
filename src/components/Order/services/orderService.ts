// src/services/orderService.ts
import api from '../../../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Order service — thin axios wrappers for the Orders API
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderItemDTO = {
  itemId:   string;
  quantity: number;
  notes?:   string;
  [k: string]: any;
};

export type CustomerLocation = {
  address?:     string;
  coordinates?: number[];   // [lng, lat]
  type?:        string;     // "Point"
};

export type Order = {
  id?:          string;
  _id?:         string;
  orderId?:     number;
  orderNumber?: string;       // e.g. "ORD-260318-0001"
  orderType?:   string;       // "dine-in" | "takeaway" | "delivery"
  tableNumber?: string | null;
  items?:       OrderItemDTO[];
  paymentMethod?: string;
  branch?:      string;
  branchId?:    string;
  status?:      string;
  notes?:       string;

  // ── delivery-specific ─────────────────────────────────────────
  customer?: {
    name?:  string;
    phone?: string;
    [k: string]: any;
  };
  customerLocation?: CustomerLocation;
  deliveryAddress?:  string;

  // ── meta ─────────────────────────────────────────────────────
  createdBy?:  string;
  updatedBy?:  string;
  createdAt?:  string;
  updatedAt?:  string;
  [k: string]: any;
};

export type OrdersListResponse = {
  message?: string;
  data?: Order[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?:       number;
    totalDocs?:   number;
    totalPages?:  number;
  };
  [k: string]: any;
};

export type OrdersQueryParams = {
  sort?:      string;
  status?:    string;   // lifecycle: pending | ready | completed | cancelled
  orderType?: string;   // ← FIX: "dine-in" | "takeaway" | "delivery"  (was wrongly mapped to status before)
  from?:      string;   // YYYY-MM-DD
  to?:        string;
  keyword?:   string;
  limit?:     number;
  page?:      number;
  branchId?:  string;
  [k: string]: any;
};

export type CreateOrderDTO = {
  orderType:     'dine-in' | 'takeaway' | 'delivery' | string;
  tableNumber?:  string | null;
  items:         OrderItemDTO[];
  paymentMethod: string;
  branchId:      string;
  notes?:        string;

  // ── delivery fields — REQUIRED for dispatch auto-creation ────
  customer?: {
    name?:  string;
    phone?: string;
    [k: string]: any;
  };
  customerLocation?: CustomerLocation;
  deliveryAddress?:  string;

  [k: string]: any;
};

export type UpdateOrderDTO = Partial<{
  notes:         string;
  tableNumber:   string | null;
  paymentMethod: string;
  customer:      { name?: string; phone?: string };
  [k: string]: any;
}>;

export type UpdateStatusDTO = {
  status: string;
  [k: string]: any;
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/orders
 */
export const createOrder = async (data: CreateOrderDTO): Promise<any> => {
  const res = await api.post('/orders', data);
  return res.data;
};

/**
 * GET /api/v1/orders
 * Supports orderType param for filtering by delivery/dine-in/takeaway
 */
export const getOrders = async (params?: OrdersQueryParams): Promise<OrdersListResponse> => {
  const res = await api.get('/orders', { params });
  return res.data;
};

/**
 * GET /api/v1/orders/:id
 */
export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

/**
 * PATCH /api/v1/orders/:id
 */
export const updateOrder = async (id: string, data: UpdateOrderDTO): Promise<any> => {
  const res = await api.patch(`/orders/${id}`, data);
  return res.data;
};

/**
 * PATCH /api/v1/orders/status/:id
 */
export const updateOrderStatus = async (id: string, payload: UpdateStatusDTO): Promise<any> => {
  const res = await api.patch(`/orders/status/${id}`, payload);
  return res.data;
};

/**
 * PATCH /api/v1/orders/cancel/:id
 */
export const cancelOrder = async (id: string): Promise<any> => {
  const res = await api.patch(`/orders/cancel/${id}`);
  return res.data;
};

/**
 * DELETE /api/v1/orders/:id
 */
export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};