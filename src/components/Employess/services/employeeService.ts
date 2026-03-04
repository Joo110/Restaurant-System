// src/services/employeeService.ts
import api from '../../../lib/axios';
/* eslint-disable @typescript-eslint/no-explicit-any */

export type BankInfo = {
  name?: string;
  accountNumber?: string;
  [k: string]: any;
};

export type Address = {
  street?: string;
  city?: string;
  country?: string;
  [k: string]: any;
};

export type Employee = {
  id?: string;
  _id?: string;
  employeeId?: number;
  fullName: string;
  email?: string;
  phone?: string;
  address?: Address;
  position?: string;
  department?: string;
  startDate?: string;
  startingSalary?: number;
  currentSalary?: number;
  bonus?: number;
  vacationDays?: number;
  trainingHours?: number;
  bankAccount?: BankInfo;
  branchId?: string;
  profileImage?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

export type EmployeesListResponse = {
  message?: string;
  data?: Employee[];
  results?: number;
  paginationResult?: {
    currentPage?: number;
    limit?: number;
    totalDocs?: number;
    totalPages?: number;
  };
  [k: string]: any;
};

export type EmployeesQueryParams = {
  sort?: string;
  fields?: string;
  department?: string;
  from?: string;
  to?: string;
  'employeeId[lte]'?: number;
  'employeeId[gte]'?: number;
  status?: string;
  keyword?: string;
  limit?: number;
  page?: number;
  branchId?: string;
  [k: string]: any;
};

export type CreateEmployeeDTO = {
  fullName: string;
  email?: string;
  phone?: string;
  address?: Address | string;
  position?: string;
  department?: string;
  startDate?: string;
  startingSalary?: number;
  bonus?: number;
  vacationDays?: number;
  trainingHours?: number;
  bankAccount?: BankInfo | string;
  branchId?: string;
  profileImage?: File | string;
  [k: string]: any;
};

export type UpdateEmployeeDTO = {
  currentSalary?: number;
  bonus?: number;
  position?: string;
  profileImage?: File | string;
  [k: string]: any;
};

/* -------------------- helpers -------------------- */

/**
 * Flatten a nested object into FormData with bracket notation.
 * e.g. { address: { street: "X" } } → fd.append("address[street]", "X")
 * Plain strings/numbers/booleans are appended as-is.
 * Files are appended as File objects.
 */
const toFormData = (data: Record<string, any>): FormData => {
  const fd = new FormData();

  const append = (fd: FormData, key: string, val: any) => {
    if (val === undefined || val === null) return;
    if (val instanceof File) {
      fd.append(key, val);
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => append(fd, `${key}[${i}]`, item));
    } else if (typeof val === 'object') {
      // flatten nested object: address → address[street], bankAccount → bankAccount[name]
      Object.entries(val).forEach(([k, v]) => append(fd, `${key}[${k}]`, v));
    } else {
      fd.append(key, String(val));
    }
  };

  Object.entries(data).forEach(([key, val]) => append(fd, key, val));
  return fd;
};

/* -------------------- API calls -------------------- */

/**
 * POST /api/v1/employees
 */
export const createEmployee = async (data: CreateEmployeeDTO): Promise<any> => {
  const fd = toFormData(data);
  const res = await api.post('/employees', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * GET /api/v1/employees
 */
export const getEmployees = async (params?: EmployeesQueryParams): Promise<EmployeesListResponse> => {
  const res = await api.get('/employees', { params });
  return res.data;
};

/**
 * GET /api/v1/employees/:id
 */
export const getEmployeeById = async (id: string): Promise<Employee> => {
  const res = await api.get(`/employees/${id}`);
  // API might return: { data: {...} } or { employee: {...} } or the object directly
  return res.data?.data ?? res.data?.employee ?? res.data;
};

/**
 * PATCH /api/v1/employees/:id
 */
export const updateEmployee = async (id: string, data: UpdateEmployeeDTO): Promise<any> => {
  const fd = toFormData(data);
  const res = await api.patch(`/employees/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * DELETE /api/v1/employees/:id
 */
export const deleteEmployee = async (id: string): Promise<void> => {
  await api.delete(`/employees/${id}`);
};