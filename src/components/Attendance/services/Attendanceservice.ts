// src/services/attendanceService.ts
import api from '../../../lib/axios';
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Attendance = {
  id?: string;
  _id?: string;
  employeeId?: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  status?: 'present' | 'absent' | 'late' | 'half-day' | string;
  hoursWorked?: number;
  overtimeHours?: number;
  notes?: string;
  branchId?: string;
  extraShift?: {
    shiftType?: string;
    reason?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export type AttendanceListResponse = {
  message?: string;
  data?: Attendance[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
  [k: string]: any;
};

export type AttendanceStatsResponse = {
  message?: string;
  data?: {
    totalPresent?: number;
    totalAbsent?: number;
    totalLate?: number;
    totalOvertimeHours?: number;
    [k: string]: any;
  };
  [k: string]: any;
};

export type AttendanceQueryParams = {
  sort?: string;
  fields?: string;
  status?: string;
  from?: string;
  to?: string;
  'employeeId[lte]'?: number;
  'employeeId[gte]'?: number;
  'overtimeHours[gte]'?: number;
  keyword?: string;
  limit?: number;
  page?: number;
  [k: string]: any;
};

export type AttendanceStatsParams = {
  from?: string;
  to?: string;
  branchId?: string;
  [k: string]: any;
};

export type CreateAttendanceDTO = {
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status?: string;
  branchId?: string;
  notes?: string;
  [k: string]: any;
};

export type UpdateAttendanceDTO = {
  checkIn?: string;
  checkOut?: string;
  status?: string;
  notes?: string;
  [k: string]: any;
};

export type ExtraShiftDTO = {
  shiftType: string;
  reason?: string;
  [k: string]: any;
};

/* -------------------- API calls -------------------- */

/**
 * POST /api/v1/attendance
 */
export const createAttendance = async (data: CreateAttendanceDTO): Promise<any> => {
  const res = await api.post('/attendance', data);
  return res.data;
};

/**
 * GET /api/v1/attendance
 */
export const getAttendances = async (params?: AttendanceQueryParams): Promise<AttendanceListResponse> => {
  const res = await api.get('/attendance', { params });
  return res.data;
};

/**
 * GET /api/v1/attendance/stats
 */
export const getAttendanceStats = async (params?: AttendanceStatsParams): Promise<AttendanceStatsResponse> => {
  const res = await api.get('/attendance/stats', { params });
  return res.data;
};

/**
 * GET /api/v1/attendance/:id
 */
export const getAttendanceById = async (id: string): Promise<Attendance> => {
  const res = await api.get(`/attendance/${id}`);
  return res.data;
};

/**
 * PATCH /api/v1/attendance/:id
 */
export const updateAttendance = async (id: string, data: UpdateAttendanceDTO): Promise<any> => {
  const res = await api.patch(`/attendance/${id}`, data);
  return res.data;
};

/**
 * PATCH /api/v1/attendance/extra-shift/:id
 */
export const addExtraShift = async (id: string, data: ExtraShiftDTO): Promise<any> => {
  const res = await api.patch(`/attendance/extra-shift/${id}`, data);
  return res.data;
};

/**
 * DELETE /api/v1/attendance/:id
 */
export const deleteAttendance = async (id: string): Promise<void> => {
  await api.delete(`/attendance/${id}`);
};