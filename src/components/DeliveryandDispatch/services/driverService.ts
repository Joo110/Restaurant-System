// src/services/driverService.ts
import api from '../../../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Driver service — thin axios wrappers for the Drivers API
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type DriverStatus = 'present' | 'absent' | 'busy' | 'offline' | string;
export type VehicleType  = 'scooter' | 'car' | 'bicycle' | string;

export type DriverTodayStats = {
  assigned?:  number;
  delivered?: number;
};

export type Driver = {
  // ── identifiers ──────────────────────────────────
  id?:   string;          // API returns "id" (not "_id")

  // ── personal ─────────────────────────────────────
  name?:  string;
  phone?: string;
  email?: string;

  // ── vehicle ──────────────────────────────────────
  vehicleType?:  VehicleType;
  vehiclePlate?: string;

  // ── status ───────────────────────────────────────
  status?: DriverStatus;

  // ── areas ────────────────────────────────────────
  assignedAreas?: string[];

  // ── stats ────────────────────────────────────────
  totalDeliveries?:      number;
  successfulDeliveries?: number;
  failedDeliveries?:     number;
  rating?:               number;
  todayStats?:           DriverTodayStats;

  // ── branch / meta ────────────────────────────────
  branch?:    string;        // branch name (not id)
  branchId?:  string;        // used when creating
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;

  [k: string]: any;
};

export type DriversListResponse = {
  message?: string;
  data?: Driver[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
  [k: string]: any;
};

export type DriversQueryParams = {
  sort?: string;          // e.g. "-createdAt"
  status?: DriverStatus;
  vehicleType?: VehicleType;
  limit?: number;
  page?: number;
  [k: string]: any;
};

export type DriverStatsQueryParams = {
  branchId: string;
  [k: string]: any;
};

export type CreateDriverDTO = {
  name: string;
  phone: string;
  email?: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  assignedAreas?: string[];
  branchId: string;
  [k: string]: any;
};

export type UpdateDriverDTO = Partial<{
  name: string;
  phone: string;
  email: string;
  vehicleType: VehicleType;
  vehiclePlate: string;
  assignedAreas: string[];
  branchId: string;
  [k: string]: any;
}>;

export type UpdateDriverStatusDTO = {
  status: DriverStatus;
  [k: string]: any;
};

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/dispatch/drivers
 */
export const createDriver = async (data: CreateDriverDTO): Promise<any> => {
  const res = await api.post('/dispatch/drivers', data);
  return res.data;
};

/**
 * GET /api/v1/dispatch/drivers
 * Query params: sort, status, vehicleType, limit, page
 */
export const getAllDrivers = async (
  params?: DriversQueryParams
): Promise<DriversListResponse> => {
  const res = await api.get('/dispatch/drivers', { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/drivers/stats?branchId=xxx
 */
export const getDriverStats = async (
  params: DriverStatsQueryParams
): Promise<any> => {
  const res = await api.get('/dispatch/drivers/stats', { params });
  return res.data;
};

/**
 * GET /api/v1/dispatch/drivers/:driverId
 */
export const getDriverById = async (driverId: string): Promise<Driver> => {
  const res = await api.get(`/dispatch/drivers/${driverId}`);
  return res.data;
};

/**
 * PATCH /api/v1/dispatch/drivers/:driverId/status
 * Body: { status: "busy" }
 */
export const updateDriverStatus = async (
  driverId: string,
  data: UpdateDriverStatusDTO
): Promise<any> => {
  const res = await api.patch(`/dispatch/drivers/${driverId}/status`, data);
  return res.data;
};

/**
 * PATCH /api/v1/dispatch/drivers/:driverId
 * Body: { vehiclePlate, assignedAreas, ... }
 */
export const updateDriver = async (
  driverId: string,
  data: UpdateDriverDTO
): Promise<any> => {
  const res = await api.patch(`/dispatch/drivers/${driverId}`, data);
  return res.data;
};

/**
 * DELETE /api/v1/dispatch/drivers/:driverId
 */
export const deleteDriver = async (driverId: string): Promise<void> => {
  await api.delete(`/dispatch/drivers/${driverId}`);
};