// src/services/settlementService.ts
import api from '../../../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SettlementStatus = 'pending' | 'settled' | string;

export type Settlement = {
  id?:                  string;
  driverId?:            string;
  driverName?:          string;
  branchId?:            string;
  branch?:              string;
  shiftDate?:           string;        // "2026-03-18"
  shiftStart?:          string;        // ISO datetime
  shiftEnd?:            string;        // ISO datetime
  totalOrders?:         number;
  deliveredOrders?:     number;
  failedOrders?:        number;
  totalCashCollected?:  number;
  totalDeliveryFees?:   number;
  totalCommission?:     number;
  status?:              SettlementStatus;
  settledAt?:           string;
  notes?:               string;
  createdAt?:           string;
  updatedAt?:           string;
  [k: string]: any;
};

export type SettlementsListResponse = {
  message?: string;
  data?: Settlement[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?:       number;
    totalDocs?:   number;
    totalPages?:  number;
  };
  [k: string]: any;
};

export type SettlementsQueryParams = {
  sort?:     string;           // e.g. "-shiftDate"
  driverId?: string;
  status?:   SettlementStatus;
  limit?:    number;
  page?:     number;
  [k: string]: any;
};

export type SettlementStatsQueryParams = {
  branchId: string;
  from?:    string;   // "YYYY-MM-DD"
  to?:      string;   // "YYYY-MM-DD"
  [k: string]: any;
};

export type CreateSettlementDTO = {
  driverId:            string;
  branchId:            string;
  shiftDate:           string;        // "YYYY-MM-DD"
  shiftStart:          string;        // ISO datetime
  shiftEnd:            string;        // ISO datetime
  totalOrders:         number;
  deliveredOrders:     number;
  failedOrders:        number;
  totalCashCollected:  number;
  totalDeliveryFees:   number;
  totalCommission:     number;
  [k: string]: any;
};

export type SettleShiftDTO = {
  settledAt?: string;   // ISO datetime — defaults to now if omitted
  notes?:     string;
  [k: string]: any;
};

export type UpdateSettlementDTO = Partial<{
  notes:               string;
  totalCashCollected:  number;
  totalDeliveryFees:   number;
  totalCommission:     number;
  [k: string]: any;
}>;

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/dispatch/settlements
 */
export const createSettlement = async (
  data: CreateSettlementDTO
): Promise<any> => {
  const res = await api.post('/dispatch/settlements', data);
  return res.data;
};

/**
 * GET /api/v1/dispatch/settlements?sort=-shiftDate&limit=10&page=1
 */
export const getAllSettlements = async (
  params?: SettlementsQueryParams
): Promise<SettlementsListResponse> => {
  const res = await api.get('/dispatch/settlements', { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/settlements/stats?branchId=xxx&from=...&to=...
 */
export const getSettlementStats = async (
  params: SettlementStatsQueryParams
): Promise<any> => {
  const res = await api.get('/dispatch/settlements/stats', { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/settlements/driver/:driverId?limit=20
 */
export const getDriverSettlements = async (
  driverId: string,
  params?: { limit?: number; [k: string]: any }
): Promise<any> => {
  const res = await api.get(`/dispatch/settlements/driver/${driverId}`, { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/settlements/:settlementId
 */
export const getSettlementById = async (
  settlementId: string
): Promise<Settlement> => {
  const res = await api.get(`/dispatch/settlements/${settlementId}`);
  return res.data;
};

/**
 * POST /api/v1/dispatch/settlements/:settlementId/settle
 * Closes the shift and marks it as settled.
 */
export const settleShift = async (
  settlementId: string,
  data?: SettleShiftDTO
): Promise<any> => {
  const res = await api.post(`/dispatch/settlements/${settlementId}/settle`, data ?? {
    settledAt: new Date().toISOString(),
  });
  return res.data;
};

/**
 * PATCH /api/v1/dispatch/settlements/:settlementId
 */
export const updateSettlement = async (
  settlementId: string,
  data: UpdateSettlementDTO
): Promise<any> => {
  const res = await api.patch(`/dispatch/settlements/${settlementId}`, data);
  return res.data;
};

/**
 * DELETE /api/v1/dispatch/settlements/:settlementId
 */
export const deleteSettlement = async (
  settlementId: string
): Promise<void> => {
  await api.delete(`/dispatch/settlements/${settlementId}`);
};