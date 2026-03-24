// src/services/dispatchService.ts
import api from '../../../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Dispatch service — thin axios wrappers for the Dispatch API
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type DispatchStatus =
  | 'assigned'
  | 'picked-up'
  | 'out-for-delivery'
  | 'delivered'
  | 'failed';

export type FailureReason =
  | 'customer-unavailable'
  | 'wrong-address'
  | 'cancelled'
  | string;

export type CustomerLocation = {
  type?:        string;              // "Point"
  coordinates?: [number, number];    // [lng, lat]
  address?:     string;
};

export type DispatchTimeline = {
  _id?:       string;
  status?:    string;
  timestamp?: string;
  note?:      string;
  location?:  { coordinates?: number[] };
};

export type Dispatch = {
  // ── identifiers ──────────────────────────────────────────
  id?:          string;             // from API (not _id)
  orderId?:     string;             // ref to the Order doc
  orderNumber?: string;             // human-readable e.g. "ORD-260318-0001"

  // ── driver ───────────────────────────────────────────────
  driverId?:   string;
  driverName?: string;

  // ── timing ───────────────────────────────────────────────
  assignedAt?: string;
  createdAt?:  string;

  // ── status ───────────────────────────────────────────────
  status?: DispatchStatus;

  // ── location ─────────────────────────────────────────────
  customerLocation?: CustomerLocation;

  // ── financials ───────────────────────────────────────────
  deliveryFee?:   number;
  commission?:    number;
  cashCollected?: number;

  // ── failure ──────────────────────────────────────────────
  failureReason?: FailureReason;
  failureNotes?:  string;

  // ── timeline ─────────────────────────────────────────────
  timeline?: DispatchTimeline[];

  // ── branch ───────────────────────────────────────────────
  branch?: string;

  [k: string]: any;
};

export type DispatchesListResponse = {
  message?: string;
  data?: Dispatch[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
  [k: string]: any;
};

export type DispatchesQueryParams = {
  sort?: string;           // e.g. "-assignedAt"
  status?: DispatchStatus;
  driverId?: string;
  limit?: number;
  page?: number;
  [k: string]: any;
};

export type ActiveDispatchesQueryParams = {
  branchId: string;
  [k: string]: any;
};

export type RecentActivityQueryParams = {
  branchId: string;
  [k: string]: any;
};

export type DriverDispatchesQueryParams = {
  status?: DispatchStatus | string;
  limit?: number;
  [k: string]: any;
};

export type CreateDispatchDTO = {
  orderId:          string;
  driverId:         string;
  branchId:         string;
  deliveryFee?:     number;
  commission?:      number;
  cashCollected?:   number;
  customerLocation?: {
    coordinates?: [number, number];  // [lng, lat]
    address?:     string;
  };
  [k: string]: any;
};

export type UpdateDispatchStatusDTO = {
  status: DispatchStatus | string;
  [k: string]: any;
};

export type MarkDispatchFailedDTO = {
  status: 'failed';
  failureReason: FailureReason;
  failureNotes?: string;
  [k: string]: any;
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/dispatch/dispatches
 * Assign an existing delivery order to a driver — creates the dispatch record.
 */
export const createDispatch = async (
  data: CreateDispatchDTO
): Promise<any> => {
  const res = await api.post('/dispatch/dispatches', data);
  return res.data;
};

/**
 * GET /api/v1/dispatch/dispatches
 * Query params: sort, status, driverId, limit, page
 */
export const getAllDispatches = async (
  params?: DispatchesQueryParams
): Promise<DispatchesListResponse> => {
  const res = await api.get('/dispatch/dispatches', { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/dispatches/active?branchId=xxx
 */
export const getActiveDispatches = async (
  params: ActiveDispatchesQueryParams
): Promise<any> => {
  const res = await api.get('/dispatch/dispatches/active', { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/dispatches/recent-activity?branchId=xxx
 */
export const getRecentActivity = async (
  params: RecentActivityQueryParams
): Promise<any> => {
  const res = await api.get('/dispatch/dispatches/recent-activity', { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/dispatches/driver/:driverId?status=...&limit=...
 */
export const getDriverDispatches = async (
  driverId: string,
  params?: DriverDispatchesQueryParams
): Promise<any> => {
  const res = await api.get(`/dispatch/dispatches/driver/${driverId}`, { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/dispatches/:dispatchId
 */
export const getDispatchById = async (dispatchId: string): Promise<Dispatch> => {
  const res = await api.get(`/dispatch/dispatches/${dispatchId}`);
  return res.data;
};

/**
 * PATCH /api/v1/dispatch/dispatches/:dispatchId
 * Body: { status: "out-for-delivery" }
 */
export const updateDispatchStatus = async (
  dispatchId: string,
  data: UpdateDispatchStatusDTO
): Promise<any> => {
  const res = await api.patch(`/dispatch/dispatches/${dispatchId}`, data);
  return res.data;
};

/**
 * PATCH /api/v1/dispatch/dispatches/:dispatchId
 * Body: { status: "failed", failureReason: "...", failureNotes: "..." }
 */
export const markDispatchFailed = async (
  dispatchId: string,
  data: MarkDispatchFailedDTO
): Promise<any> => {
  const res = await api.patch(`/dispatch/dispatches/${dispatchId}`, data);
  return res.data;
};