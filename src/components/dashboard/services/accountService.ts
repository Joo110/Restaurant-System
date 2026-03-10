// src/services/accountService.ts
import api from '../../../lib/axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─────────────────────────── Shared ───────────────────────────

export type AccountsQueryParams = {
  branchId?: string;
  from?: string;   // YYYY-MM-DD
  to?: string;
  year?: number;
  [k: string]: any;
};

// ─────────────────────────── Dashboard ───────────────────────────

export type DashboardData = {
  totalSales: { value: number; change: string };
  totalOrders: { value: number; change: string };
  activeTables: { value: string; change: string };
  staffOnShift: { value: number; total: number; percentage: number };
  topSellingDishes: any[];
  orderStatusBreakdown: any[];
  busyHours: any[];
  kitchenPerformance: { breakfast: string; lunch: string; dinner: string };
  lowStockAlerts: { name: string; current: number; target: number }[];
  menuStats: {
    totalItems: number;
    activeItems: number;
    averagePrice: number;
    topCategories: { category: string; count: number; value: number }[];
  };
};

export type DashboardResponse = {
  message: string;
  data: DashboardData;
};

// ─────────────────────────── Executive ───────────────────────────

export type BranchPerformance = {
  id: string;
  name: string;
  location: string;
  revenue: number;
  profit: number;
  change: string;
};

export type ExecutiveData = {
  summary: {
    totalRevenue: { value: number; change: string };
    totalOrders: { value: number; change: string };
    netProfit: number;
    totalExpenses: number;
    profitMargin: number;
  };
  branchPerformance: BranchPerformance[];
  topPerformingLocations: BranchPerformance[];
  menuPerformance: {
    name: string;
    category: string;
    price: number;
    totalSold: number;
    revenue: number;
  }[];
};

export type ExecutiveResponse = {
  message: string;
  data: ExecutiveData;
};

// ─────────────────────────── Finance ───────────────────────────

export type FinanceData = {
  summary: {
    totalRevenue: number;
    totalRevenueChange: string;
    totalExpenses: number;
    netProfit: number;
    profitMargin: string;
    totalInventoryValue: number;
  };
  monthlyRevenue: { month: number; revenue: number }[];
  expenseBreakdown: { category: string; percentage: number; amount: number }[];
  revenueByType: { type: string; revenue: number }[];
  payrollSummary: { currentYear: number; nextPayroll: number };
};

export type FinanceResponse = {
  message: string;
  data: FinanceData;
};

// ─────────────────────────── Reports ───────────────────────────

export type ReportsData = {
  branchInfo: {
    name: string;
    dateRange: { from: string; to: string };
  };
  summary: {
    totalRevenue: number;
    revenueChange: string;
    netProfit: number;
    totalOrders: number;
    thisWeek: number;
  };
  revenuePerMonth: { month: number; revenue: number; percentage: number }[];
  topSellingDishes: { name: string; orders: number; revenue: number; category: string; price: number }[];
  orderStatusBreakdown: { completed: number; pending: number; cancelled: number };
  kitchenPerformance: { breakfast: string; lunch: string; dinner: string };
  categoryPerformance: { category: string; orders: number; revenue: number }[];
  inventorySummary: {
    totalItems: number;
    lowStock: { name: string; current: number; target: number }[];
  };
  staffSummary: { totalEmployees: number; attendanceRate: string };
};

export type ReportsResponse = {
  message: string;
  data: ReportsData;
};

/* ─────────────────────────── API calls ─────────────────────────── */

/**
 * GET /api/v1/accounts/dashboard
 */
export const getDashboard = async (params?: Pick<AccountsQueryParams, 'branchId'>): Promise<DashboardResponse> => {
  const res = await api.get('/accounts/dashboard', { params });
  return res.data;
};

/**
 * GET /api/v1/accounts/executive
 */
export const getExecutive = async (params?: Pick<AccountsQueryParams, 'branchId' | 'from' | 'to'>): Promise<ExecutiveResponse> => {
  const res = await api.get('/accounts/executive', { params });
  return res.data;
};

/**
 * GET /api/v1/accounts/finance
 */
export const getFinance = async (params?: Pick<AccountsQueryParams, 'branchId' | 'year'>): Promise<FinanceResponse> => {
  const res = await api.get('/accounts/finance', { params });
  return res.data;
};

/**
 * GET /api/v1/accounts/reports
 */
export const getReports = async (params?: Pick<AccountsQueryParams, 'branchId' | 'from' | 'to'>): Promise<ReportsResponse> => {
  const res = await api.get('/accounts/reports', { params });
  return res.data;
};