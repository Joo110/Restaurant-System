// src/services/orderService.ts
import api from '../../../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

// ── Pagination shapes — covers all common API conventions ────────────────────
// Shape A: { paginationResult: { currentPage, limit, totalDocs, totalPages } }
// Shape B: { pagination: { totalPages, pages, total, page } }
// Shape C: { meta: { totalPages, pages, total, page } }

type PaginationResult = {
  currentPage?: number;
  limit?:       number;
  totalDocs?:   number;
  totalPages?:  number;
};

type PaginationMeta = {
  page?:       number;
  limit?:      number;
  total?:      number;
  pages?:      number;
  totalPages?: number;
};

export type OrdersListResponse = {
  message?:          string;
  data?:             Order[];
  results?:          number;          // sometimes used as totalDocs shorthand
  paginationResult?: PaginationResult; // Shape A (most common in this codebase)
  pagination?:       PaginationMeta;  // Shape B
  meta?:             PaginationMeta;  // Shape C
  [k: string]: any;
};

export type OrdersQueryParams = {
  sort?:      string;
  status?:    string;
  orderType?: string;
  from?:      string;
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

export const createOrder = async (data: CreateOrderDTO): Promise<any> => {
  const res = await api.post('/orders', data);
  return res.data;
};

export const getOrders = async (params?: OrdersQueryParams): Promise<OrdersListResponse> => {
  const res = await api.get('/orders', { params });
  return res.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const updateOrder = async (id: string, data: UpdateOrderDTO): Promise<any> => {
  const res = await api.patch(`/orders/${id}`, data);
  return res.data;
};

export const updateOrderStatus = async (id: string, payload: UpdateStatusDTO): Promise<any> => {
  const res = await api.patch(`/orders/status/${id}`, payload);
  return res.data;
};

export const cancelOrder = async (id: string): Promise<any> => {
  const res = await api.patch(`/orders/cancel/${id}`);
  return res.data;
};

export const deleteOrder = async (id: string): Promise<void> => {
  await api.delete(`/orders/${id}`);
};